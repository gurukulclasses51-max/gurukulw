import express, { type NextFunction, type Request, type Response } from 'express';
import crypto from 'crypto';
import { DEFAULT_HOMEPAGE_SECTIONS } from '../data/cmsDefaults.ts';
import type {
  AdminActivityItem,
  AdmissionRecord,
  CmsBundle,
  EnquiryRecord,
  HomepageSection,
  NavigationItem,
  PageSeoItem,
  PaymentSubmission,
  PopupSetting,
  SiteSettings,
} from '../types/cms.ts';
import {
  deleteMediaAsset,
  exportFullBackup,
  getStorageStatus,
  importFullBackup,
  listAllMediaAssets,
  readCms,
  readStore,
  readUploadedFile,
  saveUploadedFile,
  writeCms,
  writeStore,
  type CmsPersisted,
} from './storage.ts';

const VALID_ENTITIES = [
  'courses',
  'exams',
  'lectures',
  'results',
  'faculty',
  'testimonials',
  'galleryAlbums',
  'galleryMedia',
  'blogs',
  'banners',
] as const;

type EntityKey = (typeof VALID_ENTITIES)[number];

function asyncRoute(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

function pushActivity(
  cms: CmsPersisted,
  action: string,
  entityName: string,
  recordLabel: string,
  actorEmail?: string
): void {
  const entry: AdminActivityItem = {
    id: crypto.randomUUID(),
    action,
    entity_name: entityName,
    record_label: String(recordLabel || '').slice(0, 120),
    actor_email: actorEmail || cms.adminAccount.email,
    created_at: new Date().toISOString(),
  };
  cms.adminActivity = [entry, ...cms.adminActivity].slice(0, 60);
}

function cleanPhone(phone: string): string {
  return String(phone || '').replace(/[^\d]/g, '');
}

function toPublicBundle(cms: CmsPersisted): CmsBundle {
  return {
    siteSettings: cms.siteSettings,
    navigationItems: [...cms.navigationItems].sort((a, b) => a.display_order - b.display_order),
    homepageSections: [...cms.homepageSections].sort((a, b) => a.display_order - b.display_order),
    banners: [...cms.banners].sort((a, b) => a.display_order - b.display_order),
    popupSetting: cms.popupSetting,
    pageSeo: cms.pageSeo,
    courses: [...cms.courses].sort((a, b) => a.display_order - b.display_order),
    exams: [...cms.exams].sort((a, b) => a.display_order - b.display_order),
    lectures: [...cms.lectures].sort((a, b) => a.display_order - b.display_order),
    results: [...cms.results].sort((a, b) => a.display_order - b.display_order),
    faculty: [...cms.faculty].sort((a, b) => a.display_order - b.display_order),
    testimonials: [...cms.testimonials].sort((a, b) => a.display_order - b.display_order),
    galleryAlbums: [...cms.galleryAlbums].sort((a, b) => a.display_order - b.display_order),
    galleryMedia: [...cms.galleryMedia].sort((a, b) => a.display_order - b.display_order),
    blogs: [...cms.blogs].sort((a, b) =>
      String(b.published_date || '').localeCompare(String(a.published_date || ''))
    ),
  };
}

export function createApiApp(): express.Express {
  const app = express();
  app.use(express.json({ limit: '4mb' }));

  app.get('/api/health', (_req, res) => {
    const status = getStorageStatus();
    res.json({
      ok: true,
      service: "Giri Sir's Gurukul Classes",
      storage: status.mode,
      redisConfigured: status.redisConfigured,
      blobConfigured: status.blobConfigured,
      runtime: status.runtime,
    });
  });

  // Serve uploaded files from Blob / Redis / local disk (both /uploads/* and /api/uploads/*)
  app.get(
    ['/uploads/:filename', '/api/uploads/:filename'],
    asyncRoute(async (req, res) => {
      const file = await readUploadedFile(req.params.filename);
      if (!file) {
        res.status(404).send('Not found');
        return;
      }
      res.setHeader('Content-Type', file.contentType);
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      res.send(file.buffer);
    })
  );

  // Image & PDF Document upload endpoint
  app.post(
    '/api/upload',
    asyncRoute(async (req, res) => {
      const { filename, dataUrl } = req.body || {};
      if (!dataUrl || typeof dataUrl !== 'string') {
        res.status(400).json({ error: 'Missing file payload.' });
        return;
      }
      const imgMatch = dataUrl.match(/^data:image\/([a-zA-Z0-9+.-]+);base64,(.+)$/);
      const pdfMatch = dataUrl.match(/^data:application\/pdf;base64,(.+)$/);
      if (!imgMatch && !pdfMatch) {
        res.status(400).json({
          error: 'Only PNG, JPG, GIF, SVG, WebP images or PDF files are allowed.',
        });
        return;
      }

      let ext = 'png';
      let contentType = 'image/png';
      let base64Body = '';

      if (pdfMatch) {
        ext = 'pdf';
        contentType = 'application/pdf';
        base64Body = pdfMatch[1];
      } else if (imgMatch) {
        const rawExt = imgMatch[1].toLowerCase();
        ext = rawExt === 'jpeg' ? 'jpg' : rawExt.replace('+xml', '');
        contentType =
          ext === 'svg'
            ? 'image/svg+xml'
            : ext === 'jpg'
              ? 'image/jpeg'
              : `image/${ext}`;
        base64Body = imgMatch[2];
      }

      const buffer = Buffer.from(base64Body, 'base64');
      if (buffer.length > 3 * 1024 * 1024) {
        res.status(400).json({ error: 'File must be smaller than 3 MB.' });
        return;
      }
      const safeName = String(filename || 'upload')
        .toLowerCase()
        .replace(/[^a-z0-9._-]/g, '-')
        .replace(/\.[^.]+$/, '')
        .slice(0, 48);
      const outName = `${Date.now()}-${safeName || 'asset'}.${ext}`;
      const fileUrl = await saveUploadedFile(outName, buffer, contentType);
      res.status(201).json({ ok: true, file_url: fileUrl, filename: outName });
    })
  );

  // Media Storage Library list & delete
  app.get(
    '/api/cms/media',
    asyncRoute(async (_req, res) => {
      const [items, storage] = await Promise.all([
        listAllMediaAssets(),
        Promise.resolve(getStorageStatus()),
      ]);
      res.json({ items, storage });
    })
  );

  app.delete(
    '/api/cms/media/:filename',
    asyncRoute(async (req, res) => {
      const deleted = await deleteMediaAsset(req.params.filename);
      if (!deleted) {
        res.status(404).json({ error: 'Uploaded file not found.' });
        return;
      }
      const cms = await readCms();
      pushActivity(cms, 'deleted', 'Media Storage', req.params.filename);
      await writeCms(cms);
      res.json({ ok: true });
    })
  );

  // Full Backup Export / Import
  app.get(
    '/api/cms/export',
    asyncRoute(async (_req, res) => {
      const backup = await exportFullBackup();
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="gurukul-cms-backup-${new Date().toISOString().slice(0, 10)}.json"`
      );
      res.json(backup);
    })
  );

  app.post(
    '/api/cms/import',
    asyncRoute(async (req, res) => {
      const body = req.body || {};
      if (!body.cms && !body.submissions) {
        res.status(400).json({ error: 'Invalid backup JSON file.' });
        return;
      }
      await importFullBackup(body);
      const cms = await readCms();
      pushActivity(cms, 'updated', 'Website Storage', 'Restored full JSON backup');
      await writeCms(cms);
      res.json({ ok: true });
    })
  );

  // Full CMS read
  app.get(
    '/api/cms',
    asyncRoute(async (_req, res) => {
      const cms = await readCms();
      res.json(toPublicBundle(cms));
    })
  );

  // Site Settings update
  app.put(
    '/api/cms/settings',
    asyncRoute(async (req, res) => {
      const cms = await readCms();
      const patch = (req.body || {}) as Partial<SiteSettings>;
      cms.siteSettings = { ...cms.siteSettings, ...patch, key: 'main' };
      pushActivity(
        cms,
        'updated',
        'Website Settings',
        patch.institute_name || 'Settings updated'
      );
      await writeCms(cms);
      res.json({ ok: true, siteSettings: cms.siteSettings });
    })
  );

  // Popup Settings update
  app.put(
    '/api/cms/popup',
    asyncRoute(async (req, res) => {
      const cms = await readCms();
      const patch = (req.body || {}) as Partial<PopupSetting>;
      cms.popupSetting = { ...cms.popupSetting, ...patch, key: 'main' };
      pushActivity(cms, 'updated', 'Admission Popup', cms.popupSetting.title);
      await writeCms(cms);
      res.json({ ok: true, popupSetting: cms.popupSetting });
    })
  );

  // Per-page SEO batch upsert
  app.put(
    '/api/cms/page-seo',
    asyncRoute(async (req, res) => {
      const cms = await readCms();
      const items = Array.isArray(req.body?.items) ? (req.body.items as PageSeoItem[]) : [];
      const map = new Map(cms.pageSeo.map((item) => [item.page_key, item]));
      for (const row of items) {
        if (!row?.page_key) continue;
        const existing = map.get(row.page_key);
        map.set(row.page_key, {
          id: existing?.id || `seo-${row.page_key}`,
          page_key: row.page_key,
          page_label: row.page_label || existing?.page_label || row.page_key,
          title: String(row.title || ''),
          description: String(row.description || ''),
        });
      }
      cms.pageSeo = [...map.values()];
      pushActivity(cms, 'updated', 'SEO Settings', 'Page titles & descriptions');
      await writeCms(cms);
      res.json({ ok: true, pageSeo: cms.pageSeo });
    })
  );

  // Navigation Items CRUD + reorder
  app.post(
    '/api/cms/navigation',
    asyncRoute(async (req, res) => {
      const cms = await readCms();
      const body = req.body || {};
      const label = String(body.label || '').trim();
      const linkPath = String(body.path || '').trim();
      const location = body.location === 'footer' ? 'footer' : 'header';
      if (!label || !linkPath) {
        res.status(400).json({ error: 'Link label and path are required.' });
        return;
      }
      const existingLoc = cms.navigationItems.filter((n) => n.location === location);
      const created: NavigationItem = {
        id: crypto.randomUUID(),
        label,
        path: linkPath,
        location,
        display_order:
          typeof body.display_order === 'number' ? body.display_order : existingLoc.length,
        is_visible: body.is_visible !== false,
        open_in_new_tab: Boolean(body.open_in_new_tab),
      };
      cms.navigationItems.push(created);
      pushActivity(cms, 'created', 'Navigation Link', `${label} (${location})`);
      await writeCms(cms);
      res.status(201).json({ ok: true, item: created });
    })
  );

  app.put(
    '/api/cms/navigation/reorder',
    asyncRoute(async (req, res) => {
      const cms = await readCms();
      const orderedIds = Array.isArray(req.body?.ids) ? (req.body.ids as string[]) : [];
      const orderMap = new Map(orderedIds.map((id, idx) => [id, idx]));
      cms.navigationItems = cms.navigationItems.map((item) =>
        orderMap.has(item.id) ? { ...item, display_order: orderMap.get(item.id)! } : item
      );
      await writeCms(cms);
      res.json({ ok: true });
    })
  );

  app.patch(
    '/api/cms/navigation/:id',
    asyncRoute(async (req, res) => {
      const cms = await readCms();
      const idx = cms.navigationItems.findIndex((n) => n.id === req.params.id);
      if (idx === -1) {
        res.status(404).json({ error: 'Navigation link not found.' });
        return;
      }
      cms.navigationItems[idx] = { ...cms.navigationItems[idx], ...(req.body || {}) };
      pushActivity(cms, 'updated', 'Navigation Link', cms.navigationItems[idx].label);
      await writeCms(cms);
      res.json({ ok: true, item: cms.navigationItems[idx] });
    })
  );

  app.delete(
    '/api/cms/navigation/:id',
    asyncRoute(async (req, res) => {
      const cms = await readCms();
      const target = cms.navigationItems.find((n) => n.id === req.params.id);
      if (!target) {
        res.status(404).json({ error: 'Navigation link not found.' });
        return;
      }
      cms.navigationItems = cms.navigationItems.filter((n) => n.id !== req.params.id);
      pushActivity(cms, 'deleted', 'Navigation Link', target.label);
      await writeCms(cms);
      res.json({ ok: true });
    })
  );

  // Homepage Sections CRUD + reorder + restore defaults
  app.post(
    '/api/cms/homepage',
    asyncRoute(async (req, res) => {
      const cms = await readCms();
      const body = req.body || {};
      const created: HomepageSection = {
        id: crypto.randomUUID(),
        key: String(body.key || 'custom'),
        eyebrow: String(body.eyebrow || ''),
        title: String(body.title || ''),
        subtitle: String(body.subtitle || ''),
        body: String(body.body || ''),
        image_url: String(body.image_url || ''),
        button_label: String(body.button_label || ''),
        button_link: String(body.button_link || ''),
        display_order:
          typeof body.display_order === 'number'
            ? body.display_order
            : cms.homepageSections.length,
        is_visible: body.is_visible !== false,
        items: Array.isArray(body.items) ? body.items : [],
      };
      cms.homepageSections.push(created);
      pushActivity(cms, 'created', 'Homepage Section', created.title || created.key);
      await writeCms(cms);
      res.status(201).json({ ok: true, item: created });
    })
  );

  app.put(
    '/api/cms/homepage/reorder',
    asyncRoute(async (req, res) => {
      const cms = await readCms();
      const orderedIds = Array.isArray(req.body?.ids) ? (req.body.ids as string[]) : [];
      const orderMap = new Map(orderedIds.map((id, idx) => [id, idx]));
      cms.homepageSections = cms.homepageSections.map((sec) =>
        orderMap.has(sec.id) ? { ...sec, display_order: orderMap.get(sec.id)! } : sec
      );
      pushActivity(cms, 'updated', 'Homepage Layout', 'Section order updated');
      await writeCms(cms);
      res.json({ ok: true });
    })
  );

  app.post(
    '/api/cms/homepage/restore',
    asyncRoute(async (_req, res) => {
      const cms = await readCms();
      const existingKeys = new Set(cms.homepageSections.map((s) => s.key));
      const missing = DEFAULT_HOMEPAGE_SECTIONS.filter((s) => !existingKeys.has(s.key)).map(
        (s) => ({ ...s, id: crypto.randomUUID() })
      );
      cms.homepageSections.push(...missing);
      if (missing.length > 0) {
        pushActivity(
          cms,
          'created',
          'Homepage Sections',
          `Restored ${missing.length} defaults`
        );
        await writeCms(cms);
      }
      res.json({ ok: true, added: missing.length, items: cms.homepageSections });
    })
  );

  app.patch(
    '/api/cms/homepage/:id',
    asyncRoute(async (req, res) => {
      const cms = await readCms();
      const idx = cms.homepageSections.findIndex(
        (s) => s.id === req.params.id || s.key === req.params.id
      );
      if (idx === -1) {
        res.status(404).json({ error: 'Homepage section not found.' });
        return;
      }
      cms.homepageSections[idx] = { ...cms.homepageSections[idx], ...(req.body || {}) };
      pushActivity(
        cms,
        'updated',
        'Homepage Section',
        cms.homepageSections[idx].title || cms.homepageSections[idx].key
      );
      await writeCms(cms);
      res.json({ ok: true, item: cms.homepageSections[idx] });
    })
  );

  app.delete(
    '/api/cms/homepage/:id',
    asyncRoute(async (req, res) => {
      const cms = await readCms();
      const target = cms.homepageSections.find((s) => s.id === req.params.id);
      if (!target) {
        res.status(404).json({ error: 'Homepage section not found.' });
        return;
      }
      cms.homepageSections = cms.homepageSections.filter((s) => s.id !== req.params.id);
      pushActivity(cms, 'deleted', 'Homepage Section', target.title || target.key);
      await writeCms(cms);
      res.json({ ok: true });
    })
  );

  // Banner reorder
  app.put(
    '/api/cms/banners/reorder',
    asyncRoute(async (req, res) => {
      const cms = await readCms();
      const orderedIds = Array.isArray(req.body?.ids) ? (req.body.ids as string[]) : [];
      const orderMap = new Map(orderedIds.map((id, idx) => [id, idx]));
      cms.banners = cms.banners.map((b) =>
        orderMap.has(b.id) ? { ...b, display_order: orderMap.get(b.id)! } : b
      );
      await writeCms(cms);
      res.json({ ok: true });
    })
  );

  // Generic Academic / Media / Banner Entity CRUD
  app.get(
    '/api/cms/entities/:entity',
    asyncRoute(async (req, res) => {
      const entity = req.params.entity as EntityKey;
      if (!VALID_ENTITIES.includes(entity)) {
        res.status(404).json({ error: 'Unknown CMS entity.' });
        return;
      }
      const cms = await readCms();
      res.json({ items: cms[entity] });
    })
  );

  app.post(
    '/api/cms/entities/:entity',
    asyncRoute(async (req, res) => {
      const entity = req.params.entity as EntityKey;
      if (!VALID_ENTITIES.includes(entity)) {
        res.status(404).json({ error: 'Unknown CMS entity.' });
        return;
      }
      const cms = await readCms();
      const payload = { ...(req.body || {}) };
      const created = {
        ...payload,
        id: payload.id || crypto.randomUUID(),
      };
      const list = cms[entity] as unknown as Array<{ id: string } & Record<string, unknown>>;
      list.push(created);
      const label = String(
        created.title || created.name || created.student_name || created.display_name || entity
      );
      pushActivity(cms, 'created', entity, label);
      await writeCms(cms);
      res.status(201).json({ ok: true, item: created });
    })
  );

  app.patch(
    '/api/cms/entities/:entity/:id',
    asyncRoute(async (req, res) => {
      const entity = req.params.entity as EntityKey;
      if (!VALID_ENTITIES.includes(entity)) {
        res.status(404).json({ error: 'Unknown CMS entity.' });
        return;
      }
      const cms = await readCms();
      const list = cms[entity] as unknown as Array<{ id: string } & Record<string, unknown>>;
      const idx = list.findIndex((item) => item.id === req.params.id);
      if (idx === -1) {
        res.status(404).json({ error: 'Record not found.' });
        return;
      }
      list[idx] = { ...list[idx], ...(req.body || {}) };
      const label = String(
        list[idx].title ||
          list[idx].name ||
          list[idx].student_name ||
          list[idx].display_name ||
          entity
      );
      pushActivity(cms, 'updated', entity, label);
      await writeCms(cms);
      res.json({ ok: true, item: list[idx] });
    })
  );

  app.delete(
    '/api/cms/entities/:entity/:id',
    asyncRoute(async (req, res) => {
      const entity = req.params.entity as EntityKey;
      if (!VALID_ENTITIES.includes(entity)) {
        res.status(404).json({ error: 'Unknown CMS entity.' });
        return;
      }
      const cms = await readCms();
      const list = cms[entity] as unknown as Array<{ id: string } & Record<string, unknown>>;
      const target = list.find((item) => item.id === req.params.id);
      if (!target) {
        res.status(404).json({ error: 'Record not found.' });
        return;
      }
      (cms[entity] as unknown) = list.filter((item) => item.id !== req.params.id);
      const label = String(
        target.title || target.name || target.student_name || target.display_name || entity
      );
      pushActivity(cms, 'deleted', entity, label);
      await writeCms(cms);
      res.json({ ok: true });
    })
  );

  // Activity & Admin Account
  app.get(
    '/api/cms/activity',
    asyncRoute(async (_req, res) => {
      const cms = await readCms();
      res.json({ items: cms.adminActivity });
    })
  );

  app.get(
    '/api/admin/account',
    asyncRoute(async (_req, res) => {
      const cms = await readCms();
      res.json({
        account: {
          full_name: cms.adminAccount.full_name,
          email: cms.adminAccount.email,
          role: cms.adminAccount.role,
        },
      });
    })
  );

  app.patch(
    '/api/admin/account',
    asyncRoute(async (req, res) => {
      const cms = await readCms();
      const body = req.body || {};
      if (body.full_name) cms.adminAccount.full_name = String(body.full_name).trim();
      if (body.email) cms.adminAccount.email = String(body.email).trim();
      if (body.passcode && String(body.passcode).trim().length >= 4) {
        cms.adminAccount.passcode = String(body.passcode).trim();
      }
      pushActivity(cms, 'updated', 'Admin Account', cms.adminAccount.email);
      await writeCms(cms);
      res.json({
        ok: true,
        account: {
          full_name: cms.adminAccount.full_name,
          email: cms.adminAccount.email,
          role: cms.adminAccount.role,
        },
      });
    })
  );

  app.post(
    '/api/admin/login',
    asyncRoute(async (req, res) => {
      const cms = await readCms();
      const { email, passcode } = req.body || {};
      const emailMatch =
        !email || String(email).trim().toLowerCase() === cms.adminAccount.email.toLowerCase();
      const passMatch = String(passcode || '').trim() === cms.adminAccount.passcode;
      if (!emailMatch || !passMatch) {
        res.status(401).json({ error: 'Invalid admin email or passcode.' });
        return;
      }
      res.json({
        ok: true,
        account: {
          full_name: cms.adminAccount.full_name,
          email: cms.adminAccount.email,
          role: cms.adminAccount.role,
        },
      });
    })
  );

  // Enquiries CRUD
  app.get(
    '/api/enquiries',
    asyncRoute(async (_req, res) => {
      const store = await readStore();
      res.json({ items: store.enquiries });
    })
  );

  app.post(
    '/api/enquiries',
    asyncRoute(async (req, res) => {
      const body = req.body || {};
      const studentName = String(body.student_name || '').trim();
      const phone = String(body.phone || '').trim();
      const digits = cleanPhone(phone);

      if (!studentName) {
        res.status(400).json({ error: "Please enter the student's name." });
        return;
      }
      if (digits.length < 10 || digits.length > 13) {
        res.status(400).json({ error: 'Enter a valid mobile number (10–13 digits).' });
        return;
      }

      const record: EnquiryRecord = {
        id: crypto.randomUUID(),
        student_name: studentName,
        parent_name: String(body.parent_name || '').trim(),
        phone,
        email: String(body.email || '').trim(),
        class_level: String(body.class_level || '').trim(),
        course_name: String(body.course_name || '').trim(),
        preferred_batch: String(body.preferred_batch || '').trim(),
        message: String(body.message || '').trim(),
        source: String(body.source || 'website').trim(),
        status: 'new',
        notes: [],
        created_at: new Date().toISOString(),
      };

      const store = await readStore();
      store.enquiries.unshift(record);
      await writeStore(store);

      res.status(201).json({ ok: true, item: record });
    })
  );

  app.patch(
    '/api/enquiries/:id',
    asyncRoute(async (req, res) => {
      const { id } = req.params;
      const body = req.body || {};
      const validStatuses = ['new', 'contacted', 'follow_up', 'interested', 'admitted', 'closed'];
      if (body.status !== undefined && !validStatuses.includes(body.status)) {
        res.status(400).json({ error: 'Invalid status value.' });
        return;
      }
      const store = await readStore();
      const idx = store.enquiries.findIndex((e) => e.id === id);
      if (idx === -1) {
        res.status(404).json({ error: 'Enquiry not found.' });
        return;
      }
      store.enquiries[idx] = { ...store.enquiries[idx], ...body };
      await writeStore(store);

      const cms = await readCms();
      pushActivity(cms, 'updated', 'Enquiry', store.enquiries[idx].student_name);
      await writeCms(cms);

      res.json({ ok: true, item: store.enquiries[idx] });
    })
  );

  app.delete(
    '/api/enquiries/:id',
    asyncRoute(async (req, res) => {
      const store = await readStore();
      const target = store.enquiries.find((e) => e.id === req.params.id);
      if (!target) {
        res.status(404).json({ error: 'Enquiry not found.' });
        return;
      }
      store.enquiries = store.enquiries.filter((e) => e.id !== req.params.id);
      await writeStore(store);

      const cms = await readCms();
      pushActivity(cms, 'deleted', 'Enquiry', target.student_name);
      await writeCms(cms);

      res.json({ ok: true });
    })
  );

  // Admissions CRUD
  app.get(
    '/api/admissions',
    asyncRoute(async (_req, res) => {
      const store = await readStore();
      res.json({ items: store.admissions });
    })
  );

  app.post(
    '/api/admissions',
    asyncRoute(async (req, res) => {
      const body = req.body || {};
      const studentName = String(body.student_name || '').trim();
      const parentName = String(body.parent_name || '').trim();
      const phone = String(body.phone || '').trim();
      const classLevel = String(body.class_level || '').trim();
      const digits = cleanPhone(phone);

      if (!studentName) {
        res.status(400).json({ error: "Please enter the student's name." });
        return;
      }
      if (!parentName) {
        res.status(400).json({ error: "Please enter the parent or guardian's name." });
        return;
      }
      if (digits.length < 10 || digits.length > 13) {
        res.status(400).json({ error: 'Enter a valid mobile number (10–13 digits).' });
        return;
      }
      if (!classLevel) {
        res.status(400).json({ error: 'Please select the class.' });
        return;
      }

      const id = crypto.randomUUID();
      const reference = `GSK-${id.replace(/-/g, '').slice(0, 6).toUpperCase()}`;

      const record: AdmissionRecord = {
        id,
        reference,
        student_name: studentName,
        parent_name: parentName,
        phone,
        email: String(body.email || '').trim(),
        class_level: classLevel,
        course_name: String(body.course_name || '').trim(),
        preferred_batch: String(body.preferred_batch || '').trim(),
        school: String(body.school || '').trim(),
        address: String(body.address || '').trim(),
        message: String(body.message || '').trim(),
        status: 'pending',
        notes: [],
        created_at: new Date().toISOString(),
      };

      const store = await readStore();
      store.admissions.unshift(record);
      await writeStore(store);

      res.status(201).json({ ok: true, item: record, reference });
    })
  );

  app.patch(
    '/api/admissions/:id',
    asyncRoute(async (req, res) => {
      const { id } = req.params;
      const body = req.body || {};
      const validStatuses = ['pending', 'under_review', 'approved', 'rejected', 'enrolled'];
      if (body.status !== undefined && !validStatuses.includes(body.status)) {
        res.status(400).json({ error: 'Invalid status value.' });
        return;
      }
      const store = await readStore();
      const idx = store.admissions.findIndex((a) => a.id === id);
      if (idx === -1) {
        res.status(404).json({ error: 'Application not found.' });
        return;
      }
      store.admissions[idx] = { ...store.admissions[idx], ...body };
      await writeStore(store);

      const cms = await readCms();
      pushActivity(cms, 'updated', 'Admission', store.admissions[idx].student_name);
      await writeCms(cms);

      res.json({ ok: true, item: store.admissions[idx] });
    })
  );

  app.delete(
    '/api/admissions/:id',
    asyncRoute(async (req, res) => {
      const store = await readStore();
      const target = store.admissions.find((a) => a.id === req.params.id);
      if (!target) {
        res.status(404).json({ error: 'Application not found.' });
        return;
      }
      store.admissions = store.admissions.filter((a) => a.id !== req.params.id);
      await writeStore(store);

      const cms = await readCms();
      pushActivity(cms, 'deleted', 'Admission', target.student_name);
      await writeCms(cms);

      res.json({ ok: true });
    })
  );

  // Payments CRUD
  app.get(
    '/api/payments',
    asyncRoute(async (_req, res) => {
      const store = await readStore();
      res.json({ items: store.payments });
    })
  );

  app.post(
    '/api/payments',
    asyncRoute(async (req, res) => {
      const body = req.body || {};
      const studentName = String(body.student_name || '').trim();
      const phone = String(body.phone || '').trim();
      const amount = String(body.amount || '').trim();
      if (!studentName || !phone || !amount) {
        res.status(400).json({ error: 'Student name, phone and amount are required.' });
        return;
      }
      const record: PaymentSubmission = {
        id: crypto.randomUUID(),
        student_name: studentName,
        phone,
        application_reference: String(body.application_reference || '').trim(),
        amount,
        method: String(body.method || 'UPI').trim(),
        reference_note: String(body.reference_note || '').trim(),
        proof_url: String(body.proof_url || '').trim(),
        status: 'pending',
        notes: [],
        created_at: new Date().toISOString(),
      };
      const store = await readStore();
      store.payments.unshift(record);
      await writeStore(store);
      res.status(201).json({ ok: true, item: record });
    })
  );

  app.patch(
    '/api/payments/:id',
    asyncRoute(async (req, res) => {
      const { id } = req.params;
      const body = req.body || {};
      const validStatuses = ['pending', 'verified', 'rejected'];
      if (body.status !== undefined && !validStatuses.includes(body.status)) {
        res.status(400).json({ error: 'Invalid status value.' });
        return;
      }
      const store = await readStore();
      const idx = store.payments.findIndex((p) => p.id === id);
      if (idx === -1) {
        res.status(404).json({ error: 'Payment record not found.' });
        return;
      }
      store.payments[idx] = { ...store.payments[idx], ...body };
      await writeStore(store);

      const cms = await readCms();
      pushActivity(cms, 'updated', 'Payment', store.payments[idx].student_name);
      await writeCms(cms);

      res.json({ ok: true, item: store.payments[idx] });
    })
  );

  app.delete(
    '/api/payments/:id',
    asyncRoute(async (req, res) => {
      const store = await readStore();
      const target = store.payments.find((p) => p.id === req.params.id);
      if (!target) {
        res.status(404).json({ error: 'Payment record not found.' });
        return;
      }
      store.payments = store.payments.filter((p) => p.id !== req.params.id);
      await writeStore(store);

      const cms = await readCms();
      pushActivity(cms, 'deleted', 'Payment', target.student_name);
      await writeCms(cms);

      res.json({ ok: true });
    })
  );

  // Express JSON error handler
  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    const message = err instanceof Error ? err.message : 'Internal server error';
    res.status(500).json({ error: message });
  });

  return app;
}
