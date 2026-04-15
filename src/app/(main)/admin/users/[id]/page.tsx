import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/status-badge";
import Link from "next/link";

interface User {
  id: string;
  name: string | null;
  email: string;
  roleId: string;
  roleName: string;
  active: boolean;
  deletedAt: string | null;
}

async function getUser(id: string): Promise<User | null> {
  const res = await fetch(`${process.env.NEXTAUTH_URL}/api/users/${id}`, {
    cache: "no-store",
  });
  if (!res.ok) return null;
  return res.json();
}

export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getUser(id);
  if (!user) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{user.name || user.email}</h1>
          <p className="text-muted-foreground">{user.email}</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href={`/admin/users/${id}/edit`}>Edit User</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={`/admin/users/${id}/change-password`}>Change Password</Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <span className="font-medium">Name:</span> {user.name || "-"}
            </div>
            <div>
              <span className="font-medium">Email:</span> {user.email}
            </div>
            <div>
              <span className="font-medium">Role:</span>{" "}
              <Badge variant="secondary">{user.roleName}</Badge>
            </div>
            <div>
              <span className="font-medium">Status:</span>{" "}
              <StatusBadge value={user.active ? "active" : "inactive"} />
            </div>
            {user.deletedAt && (
              <div>
                <span className="font-medium">Deleted:</span> {new Date(user.deletedAt).toLocaleDateString()}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}