"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { apiJson } from "@/lib/api-client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { InlineAlert } from "@/components/app/inline-alert";

const formSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).nullable(),
  permissionIds: z.array(z.string()),
});

type FormData = z.infer<typeof formSchema>;

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

interface Permission {
  id: string;
  code: string;
  description: string | null;
}

export default function EditRolePage() {
  const [role, setRole] = useState<Role | null>(null);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      permissionIds: [],
    },
  });

  useEffect(() => {
    Promise.all([
      apiJson<Role>(`/api/roles/${id}`),
      apiJson<Permission[]>("/api/permissions"),
    ]).then(([roleData, permissionsData]) => {
      setRole(roleData);
      setPermissions(permissionsData);
      form.reset({
        name: roleData.name,
        description: roleData.description,
        permissionIds: roleData.permissions.map((rp: any) => rp.permission.id),
      });
      setLoading(false);
    }).catch(() => {
      setError("Failed to load data");
      setLoading(false);
    });
  }, [id, form]);

  const onSubmit = async (data: FormData) => {
    setSaving(true);
    setError(null);
    try {
      await apiJson(`/api/roles/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
      router.push(`/admin/roles/${id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!role) {
    return <div>Role not found</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Edit Role</h1>
        <p className="text-muted-foreground">Update role details and permissions.</p>
      </div>

      {error && <InlineAlert tone="danger">{error}</InlineAlert>}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Role Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Permissions</CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="permissionIds"
                render={() => (
                  <FormItem>
                    <div className="grid grid-cols-2 gap-4">
                      {permissions.map((permission) => (
                        <FormField
                          key={permission.id}
                          control={form.control}
                          name="permissionIds"
                          render={({ field }) => (
                            <FormItem className="flex items-center space-x-2">
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(permission.id)}
                                  onCheckedChange={(checked: boolean) => {
                                    return checked
                                      ? field.onChange([...field.value, permission.id])
                                      : field.onChange(field.value?.filter((value) => value !== permission.id));
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="text-sm font-normal">
                                {permission.code}
                                {permission.description && ` - ${permission.description}`}
                              </FormLabel>
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}