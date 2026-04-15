import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface Role {
  id: string;
  name: string;
  description: string | null;
  permissions: Array<{
    permission: {
      id: string;
      code: string;
      description: string | null;
    };
  }>;
}

async function getRole(id: string): Promise<Role | null> {
  const res = await fetch(`${process.env.NEXTAUTH_URL}/api/roles/${id}`, {
    cache: "no-store",
  });
  if (!res.ok) return null;
  return res.json();
}

export default async function RoleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const role = await getRole(id);
  if (!role) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{role.name}</h1>
          <p className="text-muted-foreground">{role.description || "No description"}</p>
        </div>
        <Button asChild>
          <Link href={`/admin/roles/${id}/edit`}>Edit Role</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Permissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {role.permissions.length > 0 ? (
              role.permissions.map((rp) => (
                <Badge key={rp.permission.id} variant="outline">
                  {rp.permission.code}
                  {rp.permission.description && ` - ${rp.permission.description}`}
                </Badge>
              ))
            ) : (
              <p className="text-muted-foreground">No permissions assigned</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}