import { useEffect, useState, type FormEvent } from 'react';
import { LogOut, Save } from 'lucide-react';
import { useCms } from '../../context/CmsContext';
import { AdminField } from './AdminField';
import { useAdminToast } from './AdminLayout';

export function AdminAccountPage() {
  const { adminUser, updateAdminProfile, signOutAdmin } = useCms();
  const { notify } = useAdminToast();
  const [fullName, setFullName] = useState(adminUser?.full_name || '');
  const [email, setEmail] = useState(adminUser?.email || '');
  const [passcode, setPasscode] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!adminUser) return;
    setFullName(adminUser.full_name);
    setEmail(adminUser.email);
  }, [adminUser]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) {
      notify('Full name and email are required.', 'error');
      return;
    }
    setSaving(true);
    const res = await updateAdminProfile({
      full_name: fullName.trim(),
      email: email.trim(),
      passcode: passcode.trim() || undefined,
    });
    setSaving(false);
    if (res.ok) {
      setPasscode('');
      notify('Admin account details updated.');
    } else {
      notify(res.error || 'Could not update profile.', 'error');
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <form onSubmit={handleSubmit} className="surface space-y-5 p-6">
        <div className="border-b border-[hsl(var(--border))] pb-4">
          <h2 className="text-base font-bold text-[#122B5C]">Admin Account</h2>
          <p className="mt-0.5 text-xs text-[hsl(var(--muted-foreground))]">
            Signed in administrator identity and console passcode settings.
          </p>
        </div>

        <AdminField
          id="acc_name"
          label="Administrator full name"
          required
          value={fullName}
          onChange={(v) => setFullName(String(v))}
        />
        <AdminField
          id="acc_email"
          label="Admin sign-in email"
          type="email"
          required
          value={email}
          onChange={(v) => setEmail(String(v))}
        />
        <AdminField
          id="acc_pass"
          label="New admin passcode (leave blank to keep current)"
          type="password"
          placeholder="Minimum 4 characters"
          value={passcode}
          onChange={(v) => setPasscode(String(v))}
        />

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[hsl(var(--border))] pt-4">
          <button
            type="button"
            onClick={signOutAdmin}
            className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign out</span>
          </button>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#122B5C] px-4 py-2 text-xs font-bold text-white hover:bg-[#0B1D40] disabled:opacity-60"
          >
            <Save className="h-3.5 w-3.5" />
            <span>{saving ? 'Saving...' : 'Save account'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
