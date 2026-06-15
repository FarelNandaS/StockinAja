import { Head } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import axios from 'axios';
import { ArrowUpDown, PenLineIcon, PlusCircleIcon, Trash2 } from 'lucide-react';
import type { SyntheticEvent } from 'react';
import { useState } from 'react';
import { toast } from 'sonner';
import { DataTable } from '@/components/data-table';
import { ModalDialog } from '@/components/modal-dialog-form';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

type User = {
    id: number;
    name: string;
    email: string;
    role: string;
};

type usersPageProps = {
    users: User[];
};

const columns: ColumnDef<User>[] = [
    {
        accessorKey: 'id',
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === 'asc')
                    }
                >
                    ID
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
    },
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'email', header: 'Email' },
    { accessorKey: 'role', header: 'Role' },
    {
        accessorKey: 'action',
        header: 'Action',
        id: 'actions',
        cell: ({ row, table }) => {
            const user = row.original;
            const tableMeta = table.options.meta as {
                isDeleting?: boolean;
                onDelete: (user: User) => void;
                onEdit: (user: User) => void;
            };

            return (
                <div className="flex w-25 gap-4">
                    <Button
                        variant="destructive"
                        disabled={tableMeta.isDeleting}
                        onClick={() => {
                            if (tableMeta?.onDelete) {
                                tableMeta.onDelete(user);
                            }
                        }}
                    >
                        <Trash2 />
                        Delete
                    </Button>
                    <Button
                        onClick={() => {
                            if (tableMeta?.onEdit) {
                                tableMeta.onEdit(user);
                            }
                        }}
                    >
                        <PenLineIcon />
                        Edit
                    </Button>
                </div>
            );
        },
    },
];

export default function Users({ users }: usersPageProps) {
    const [data, setData] = useState(users);

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [isDeleting, setIsDeleting] = useState(false);

    const [editUserId, setEditUserId] = useState<number | null>(null);
    const [modalEditOpen, setModalEditOpen] = useState(false);
    const [editName, setEditName] = useState('');
    const [editEmail, setEditEmail] = useState('');
    const [editRole, setEditRole] = useState('');
    const [isEditing, setIsEditing] = useState(false);

    const handleSubmit = async (event: SyntheticEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsSubmitting(true);
        let userName = '';

        try {
            const response = await axios.post('/api/users', {
                name,
                email,
                password,
                role,
            });

            setData(response.data.users);
            setModalOpen(false);
            setName('');
            setEmail('');
            setPassword('');
            setRole('');

            userName = response.data.name;
        } catch (err: any) {
            if (err.response) {
                const errData = err.response.data;

                if (errData.status === 'error') {
                    return toast.error('Error Saving User', {
                        description: errData.message,
                    });
                }
            } else {
                return toast.error('Error Saving User', {
                    description: 'Error unknown reason',
                });
            }
        } finally {
            setIsSubmitting(false);
        }

        return toast.success('Success Saving User', {
            description: `Success saving user with name "${userName}"`,
        });
    };

    const handleDelete = (user: User) => {
        setIsDeleting(true);

        toast('Are You Sure?', {
            description: `Are your sure to delete user with name "${user.name}"?`,
            duration: Infinity,
            action: {
                label: 'Delete',
                onClick: () => {
                    const deletePromise = axios
                        .delete(`/api/users/${user.id}`)
                        .then((response) => {
                            if (
                                response.data.status &&
                                response.data.status === 'error'
                            ) {
                                throw new Error(
                                    response.data.message || 'Failed to delete',
                                );
                            }

                            setData(response.data.users);

                            return response.data;
                        });

                    toast.promise(deletePromise, {
                        loading: `Deleting user "${user.name}"...`,
                        success: (res) => {
                            return `The user with name "${res.name}" is deleted`;
                        },
                        error: (res) => {
                            return res.message || 'Error deleting user';
                        },
                        finally: () => {
                            setIsDeleting(false);
                        },
                    });
                },
            },
            cancel: {
                label: 'Cencel',
                onClick: () => {
                    toast.dismiss();

                    return setIsDeleting(false);
                },
            },
        });
    };

    const triggerHandleEdit = (user: User) => {
        setEditUserId(user.id);
        setEditName(user.name);
        setEditEmail(user.email);
        setEditRole(user.role);
        setModalEditOpen(true);
    };

    const handleEdit = async (event: SyntheticEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsEditing(true);
        let userName = '';

        try {
            const response = await axios.patch(`/api/users/${editUserId}`, {
                name: editName,
                email: editEmail,
                role: editRole,
            });

            setData(response.data.users);
            setModalEditOpen(false);

            userName = response.data.name;
        } catch (err: any) {
            if (err.response) {
                const errData = err.response.data;

                if (errData.status === 'error') {
                    return toast.error('Error Editing User', {
                        description: errData.message,
                    });
                } else {
                    return toast.error('Error Editing Product', {
                        description: 'Error unknown reason',
                    });
                }
            } else {
                return toast.error('Error Editing Product', {
                    description: 'Error unknown reason',
                });
            }
        } finally {
            setIsEditing(false);
        }

        return toast.success('Success Edited User', {
            description: `User with name "${userName}" has been edited`,
        });
    };

    return (
        <>
            <Head title="Users" />
            <div className="flex w-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <DataTable
                    columns={columns}
                    data={data}
                    withSideSearchElement
                    meta={{
                        isDeleting: isDeleting,
                        onDelete: handleDelete,
                        onEdit: triggerHandleEdit,
                    }}
                    sideSearchElement={
                        <ModalDialog
                            buttonIcon={<PlusCircleIcon />}
                            buttonText="Add User"
                            title="Add User"
                            btnTextSave="Save User"
                            isSubmitting={isSubmitting}
                            onOpenChange={setModalOpen}
                            open={modalOpen}
                            onSubmit={handleSubmit}
                        >
                            <Field>
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </Field>
                            <Field>
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </Field>
                            <Field>
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                />
                            </Field>
                            <Field>
                                <Label htmlFor="role">Role</Label>
                                <Select
                                    value={role}
                                    onValueChange={(value) => setRole(value)}
                                >
                                    <SelectTrigger id="role">
                                        <SelectValue placeholder="Choose Role..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectItem value="Admin">
                                                Admin
                                            </SelectItem>
                                            <SelectItem value="Staff">
                                                Staff
                                            </SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </Field>
                        </ModalDialog>
                    }
                />

                <ModalDialog
                    className="hidden"
                    title="Edit User"
                    btnTextSave="Update User"
                    isSubmitting={isEditing}
                    onOpenChange={setModalEditOpen}
                    open={modalEditOpen}
                    onSubmit={handleEdit}
                >
                    <Field>
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                        />
                    </Field>
                    <Field>
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            value={editEmail}
                            onChange={(e) => setEditEmail(e.target.value)}
                        />
                    </Field>
                    <Field>
                        <Label htmlFor="role">Role</Label>
                        <Select
                            value={editRole}
                            onValueChange={(value) => setEditRole(value)}
                        >
                            <SelectTrigger id="role">
                                <SelectValue placeholder="Choose Role..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectItem value="Admin">Admin</SelectItem>
                                    <SelectItem value="Staff">Staff</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </Field>
                </ModalDialog>
            </div>
        </>
    );
}
