"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  Save,
  ShieldCheck,
  User,
} from "lucide-react";

import { updateProfileAction } from "@/actions/settings/updateProfile";
import { updateEmailAction } from "@/actions/settings/updateEmail";
import { changePasswordAction } from "@/actions/settings/changePassword";

type ProfileSettingsCardProps = {
  user: {
    name: string | null;
    email: string | null;
    canManageCredentials: boolean;
  };
};

export default function ProfileSettingsCard({
  user,
}: ProfileSettingsCardProps) {
  const [name, setName] = useState(user.name ?? "");
  const [email, setEmail] = useState(user.email ?? "");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPasswords, setShowPasswords] = useState(false);

  const [isProfilePending, startProfileTransition] = useTransition();
  const [isEmailPending, startEmailTransition] = useTransition();
  const [isPasswordPending, startPasswordTransition] = useTransition();

  const canManageCredentials = user.canManageCredentials;

  function handleUpdateProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    startProfileTransition(async () => {
      const result = await updateProfileAction({ name });

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
    });
  }

  function handleUpdateEmail(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canManageCredentials) {
      toast.error("Email change is not available for Google sign-in accounts");
      return;
    }

    startEmailTransition(async () => {
      const result = await updateEmailAction({ email });

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
    });
  }

  function handleChangePassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canManageCredentials) {
      toast.error("Password change is not available for Google sign-in accounts");
      return;
    }

    startPasswordTransition(async () => {
      const result = await changePasswordAction({
        currentPassword,
        newPassword,
        confirmPassword,
      });

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    });
  }

  return (
    <section className="rounded-2xl border border-[#3D444D] bg-[#0D1117] p-4">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#3D444D] bg-[#151B23]">
          <ShieldCheck className="h-4 w-4 text-[#3FB950]" />
        </div>

        <div>
          <h2 className="text-sm font-semibold text-white">
            Account Settings
          </h2>
          <p className="mt-0.5 text-xs text-[#8B949E]">
            Update your name, email, and password.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <CompactSettingsCard
          title="Display name"
          description="Shown inside your dashboard."
          icon={<User className="h-4 w-4 text-[#58A6FF]" />}
        >
          <form
            onSubmit={handleUpdateProfile}
            className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-end"
          >
            <InputField
              id="name"
              label="Name"
              icon={<User className="h-4 w-4" />}
              value={name}
              disabled={isProfilePending}
              placeholder="Enter your name"
              onChange={setName}
            />

            <SubmitButton
              isPending={isProfilePending}
              text="Save"
              loadingText="Saving..."
              icon={<Save className="h-4 w-4" />}
            />
          </form>
        </CompactSettingsCard>

        <CompactSettingsCard
          title="Email address"
          description={
            canManageCredentials
              ? "Used for your LedgerOS account."
              : "Email is managed by Google."
          }
          icon={<Mail className="h-4 w-4 text-[#A371F7]" />}
        >
          <form
            onSubmit={handleUpdateEmail}
            className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-end"
          >
            <div className="space-y-2">
              <InputField
                id="email"
                label="Email"
                type="email"
                icon={<Mail className="h-4 w-4" />}
                value={email}
                disabled={isEmailPending || !canManageCredentials}
                placeholder="Enter your email"
                onChange={setEmail}
              />

              {!canManageCredentials && (
                <p className="text-xs text-[#8B949E]">
                  Email change is disabled for Google sign-in accounts.
                </p>
              )}
            </div>

            <SubmitButton
              isPending={isEmailPending}
              disabled={!canManageCredentials}
              text="Save"
              loadingText="Updating..."
              icon={<Save className="h-4 w-4" />}
            />
          </form>
        </CompactSettingsCard>

        <CompactSettingsCard
          title="Password"
          description={
            canManageCredentials
              ? "Keep your account secure."
              : "Password is managed by Google."
          }
          icon={<Lock className="h-4 w-4 text-[#3FB950]" />}
        >
          {canManageCredentials ? (
            <form onSubmit={handleChangePassword} className="space-y-3">
              <div className="grid gap-3 xl:grid-cols-3">
                <PasswordInput
                  id="current-password"
                  label="Current password"
                  value={currentPassword}
                  disabled={isPasswordPending}
                  showPassword={showPasswords}
                  onChange={setCurrentPassword}
                />

                <PasswordInput
                  id="new-password"
                  label="New password"
                  value={newPassword}
                  disabled={isPasswordPending}
                  showPassword={showPasswords}
                  onChange={setNewPassword}
                />

                <PasswordInput
                  id="confirm-password"
                  label="Confirm password"
                  value={confirmPassword}
                  disabled={isPasswordPending}
                  showPassword={showPasswords}
                  onChange={setConfirmPassword}
                />
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={() => setShowPasswords((prev) => !prev)}
                  className="inline-flex items-center gap-2 text-xs font-medium text-[#8B949E] transition hover:text-[#C9D1D9]"
                >
                  {showPasswords ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                  {showPasswords ? "Hide passwords" : "Show passwords"}
                </button>

                <SubmitButton
                  isPending={isPasswordPending}
                  text="Change password"
                  loadingText="Updating..."
                  icon={<Lock className="h-4 w-4" />}
                />
              </div>
            </form>
          ) : (
            <div className="rounded-lg border border-[#3D444D] bg-[#0D1117] p-3">
              <p className="text-sm font-medium text-[#C9D1D9]">
                Google account connected
              </p>
              <p className="mt-1 text-xs leading-5 text-[#8B949E]">
                This account uses Google sign-in, so email and password changes
                are managed by Google.
              </p>
            </div>
          )}
        </CompactSettingsCard>
      </div>
    </section>
  );
}

type CompactSettingsCardProps = {
  title: string;
  description: React.ReactNode;
  icon: React.ReactNode;
  children: React.ReactNode;
};

function CompactSettingsCard({
  title,
  description,
  icon,
  children,
}: CompactSettingsCardProps) {
  return (
    <div className="rounded-xl border border-[#3D444D] bg-[#151B23] p-3 transition hover:border-[#58A6FF]/40 sm:p-4">
      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#3D444D] bg-[#0D1117]">
          {icon}
        </div>

        <div>
          <h3 className="text-sm font-semibold text-white">{title}</h3>
          <p className="mt-0.5 text-xs text-[#8B949E]">{description}</p>
        </div>
      </div>

      {children}
    </div>
  );
}

type InputFieldProps = {
  id: string;
  label: string;
  type?: string;
  icon: React.ReactNode;
  value: string;
  disabled: boolean;
  placeholder: string;
  onChange: (value: string) => void;
};

function InputField({
  id,
  label,
  type = "text",
  icon,
  value,
  disabled,
  placeholder,
  onChange,
}: InputFieldProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block text-xs font-medium text-[#C9D1D9]"
      >
        {label}
      </label>

      <div className="relative">
        <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#8B949E]">
          {icon}
        </div>

        <input
          id={id}
          type={type}
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="h-9 w-full rounded-lg border border-[#3D444D] bg-[#0D1117] pl-10 pr-3 text-sm text-white outline-none transition placeholder:text-[#8B949E] focus:border-[#58A6FF] disabled:cursor-not-allowed disabled:opacity-60"
        />
      </div>
    </div>
  );
}

type PasswordInputProps = {
  id: string;
  label: string;
  value: string;
  disabled: boolean;
  showPassword: boolean;
  onChange: (value: string) => void;
};

function PasswordInput({
  id,
  label,
  value,
  disabled,
  showPassword,
  onChange,
}: PasswordInputProps) {
  return (
    <InputField
      id={id}
      label={label}
      type={showPassword ? "text" : "password"}
      icon={<Lock className="h-4 w-4" />}
      value={value}
      disabled={disabled}
      placeholder={label}
      onChange={onChange}
    />
  );
}

function SubmitButton({
  isPending,
  disabled = false,
  text,
  loadingText,
  icon,
}: {
  isPending: boolean;
  disabled?: boolean;
  text: string;
  loadingText: string;
  icon: React.ReactNode;
}) {
  return (
    <button
      type="submit"
      disabled={isPending || disabled}
      className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-lg bg-[#238636] px-4 text-sm font-medium text-white transition hover:bg-[#2ea043] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isPending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          {loadingText}
        </>
      ) : (
        <>
          {icon}
          {text}
        </>
      )}
    </button>
  );
}