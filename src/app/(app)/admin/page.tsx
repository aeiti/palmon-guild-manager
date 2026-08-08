import { PageHeader, SectionTitle } from "@/components/layout/page-header";
import { Card, CardBody, CardHead, CardTitle } from "@/components/ui/card";
import { WarningItem } from "@/components/domain/data/warning-item";
import { AppRoleBadge } from "@/components/domain/member/app-role-badge";
import { MOCK_ROLE_MAP } from "@/lib/mock/users";
import { getAppUsers } from "@/lib/data/queries";
import { currentRole } from "@/lib/auth/guard";
import { ErrorState } from "@/components/layout/states";
import { AdminUsersTable } from "./admin-users-table";

export const metadata = { title: "Admin" };
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const role = await currentRole();
  if (role !== "admin") {
    return (
      <div className="space-y-6">
        <PageHeader eyebrow="Access control" title="Admin" />
        <ErrorState
          title="Admins only"
          detail="You need the Admin app role to manage users and roles."
        />
      </div>
    );
  }
  const { users, members } = await getAppUsers();
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Access control"
        title="Admin"
        sub="App roles and the Discord role map. App role is independent of in-game rank."
      />

      <WarningItem
        severity="info"
        title="Role precedence: ENV allowlist → Discord role map → manual pin"
        detail="ENV-allowlisted users are always Admin (failsafe). Otherwise the Discord map applies, unless an officer pins an override. Changes here are local until auth + DB are wired."
      />

      <section className="space-y-3">
        <SectionTitle>Users</SectionTitle>
        <AdminUsersTable users={users} members={members} />
      </section>

      <section className="space-y-3">
        <SectionTitle>Discord role map</SectionTitle>
        <Card>
          <CardHead>
            <CardTitle>Discord role → app role</CardTitle>
          </CardHead>
          <CardBody className="space-y-1">
            {MOCK_ROLE_MAP.map((r) => (
              <div
                key={r.discordRoleId}
                className="flex items-center justify-between gap-3 border-b border-border/60 py-2 last:border-0"
              >
                <div className="flex min-w-0 flex-col">
                  <span className="text-sm text-text">{r.label}</span>
                  <span className="truncate font-mono text-[0.6rem] text-text-3">
                    id: {r.discordRoleId}
                  </span>
                </div>
                <AppRoleBadge role={r.appRole} />
              </div>
            ))}
          </CardBody>
        </Card>
      </section>
    </div>
  );
}
