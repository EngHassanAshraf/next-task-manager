"use client";

import { useState } from "react";
import Link from "next/link";

import { apiJson } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

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

export function RolesTable() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this role?")) return;
    setDeleting(id);
    try {
      await apiJson(`/api/roles/${id}`, { method: "DELETE" });
      setRoles(roles.filter(r => r.id !== id));
    } catch (error: any) {
      setError(error.message);
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="text-destructive">{error}</div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Permissions</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {roles.map((role) => (
          <TableRow key={role.id}>
            <TableCell>{role.name}</TableCell>
            <TableCell>{role.description || "-"}</TableCell>
            <TableCell>
              <div className="flex flex-wrap gap-1">
                {role.permissions.map((rp) => (
                  <Badge key={rp.permission.id} variant="secondary">
                    {rp.permission.code}
                  </Badge>
                ))}
              </div>
            </TableCell>
            <TableCell>
              <div className="flex gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link href={`/admin/roles/${role.id}`}>View</Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link href={`/admin/roles/${role.id}/edit`}>Edit</Link>
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(role.id)}
                  disabled={deleting === role.id}
                >
                  {deleting === role.id ? "Deleting..." : "Delete"}
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}