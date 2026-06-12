import { Head } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import axios from 'axios';
import { ArrowUpDown, PlusCircleIcon } from 'lucide-react';
import type {SyntheticEvent} from 'react';
import { useState } from 'react';
import { toast } from 'sonner';
import { DataTable } from '@/components/data-table';
import { ModalDialog } from '@/components/modal-dialog-form';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type Users = {
    id: number;
    name: string;
    email: string;
    role: string;
};

type usersPageProps = {
    users: Users[];
};

const columns: ColumnDef<Users>[] = [
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
        cell: ({ row }) => {
            const user = row.original;

            return (
                <div className="flex gap-4">
                    <Button
                        onClick={() => {
                            toast(`test ID ${user.id}`);
                        }}
                    >
                        test
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
                    description: 'Error unknown reason'
                })
            }
        } finally {
            setIsSubmitting(false);
        }

        return toast.success('Success Saving User', {
            description: `Success saving user with name "${userName}"`,
        });
    }

    return (
        <>
            <Head title="Users" />
            <div className="flex w-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <DataTable
                    columns={columns}
                    data={data}
                    withSideSearchElement
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
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </Field>
                            <Field>
                                <Label htmlFor="role">Role</Label>
                                <Select value={role} onValueChange={(value) => setRole(value)}>
                                    <SelectTrigger id='role'>
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
            </div>
        </>
    );
}
