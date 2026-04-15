"use client";

import { useState } from "react";

import { apiJson } from "@/lib/api-client";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

interface Permission {
  id: string;
  code: string;
  description: string | null;
  roles: Array<{
    role: {
      id: string;
      name: string;
    };
  }>;
}

export function PermissionsTable() {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  useState(() => {
    apiJson<Permission[]>("/api/permissions")
      .then(setPermissions)
      .catch(() => setError("Failed to load permissions"))
      .finally(() => setLoading(false));
  });

  // Group permissions by module (assuming code starts with module:)
  const grouped = permissions.reduce((acc, perm) => {
    const module = perm.code.split(":")[0] || "other";
    if (!acc[module]) acc[module] = [];
    acc[module].push(perm);
    return acc;
  }, {} as Record<string, Permission[]>);

  if (loading) {
    return <div>Loading...</div>;
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this permission?")) return;
    setDeleting(id);
    try {
      await apiJson(`/api/permissions/${id}`, { method: "DELETE" });
      setPermissions(permissions.filter(p => p.id !== id));
    } catch (error: any) {
      setError(error.message);
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([module, perms]) => (
        <div key={module}>
          <h3 className="text-lg font-semibold capitalize mb-4">{module} Permissions</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Assigned Roles</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {perms.map((permission) => (
                <TableRow key={permission.id}>
                  <TableCell className="font-mono">{permission.code}</TableCell>
                  <TableCell>{permission.description || "-"}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {permission.roles.map((rr) => (
                        <Badge key={rr.role.id} variant="secondary">
                          {rr.role.name}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(permission.id)}
                      disabled={deleting === permission.id}
                    >
                      {deleting === permission.id ? "Deleting..." : "Delete"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ))}
    </div>
  );
}