import { Head, usePage } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import axios from 'axios';
import {
    ArrowUpDown,
    Minus,
    PencilLine,
    Plus,
    PlusCircleIcon,
    Trash2,
} from 'lucide-react';
import type { SyntheticEvent } from 'react';
import { useState } from 'react';
import { toast } from 'sonner';
import { DataTable } from '@/components/data-table';
import { ModalDialog } from '@/components/modal-dialog-form';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { product } from '@/routes';

type Product = {
    id: number;
    name: string;
    quantity: number;
};

type ProductPageProps = {
    products: Product[];
};

const columns: ColumnDef<Product>[] = [
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
    {
        accessorKey: 'quantity',
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === 'asc')
                    }
                >
                    Quantity
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
    },
    {
        accessorKey: 'action',
        header: 'Action',
        id: 'actions',
        cell: ({ row, table }) => {
            const product = row.original;
            const tableMeta = table.options.meta as {
                isDeleting?: boolean;
                onDelete: (product: Product) => void;
                onEdit: (product: Product) => void;
                onManage: (product: Product, type: 'In' | 'Out') => void;
                userRoles: string[];
            };

            const userRoles = tableMeta?.userRoles || [];

            return (
                <div className="flex w-20 gap-4">
                    {userRoles.includes('Admin') && (
                        <>
                            <Button
                                variant="destructive"
                                disabled={tableMeta?.isDeleting}
                                onClick={() => {
                                    if (tableMeta?.onDelete) {
                                        tableMeta.onDelete(product);
                                    }
                                }}
                            >
                                <Trash2 />
                                Delete
                            </Button>
                            <Button
                                onClick={() => {
                                    if (tableMeta?.onEdit) {
                                        tableMeta.onEdit(product);
                                    }
                                }}
                            >
                                <PencilLine />
                                Edit
                            </Button>
                        </>
                    )}

                    {userRoles.includes('Staff') && (
                        <>
                            <Button
                                onClick={() => {
                                    if (tableMeta?.onManage) {
                                        tableMeta.onManage(product, 'In');
                                    }
                                }}
                            >
                                <Plus />
                                Stock In
                            </Button>
                            <Button onClick={() => {
                                if (tableMeta?.onManage) {
                                    tableMeta.onManage(product, 'Out');
                                }
                            }}>
                                <Minus />
                                Stock Out
                            </Button>
                        </>
                    )}
                </div>
            );
        },
    },
];

export default function Product({ products }: ProductPageProps) {
    const [data, setData] = useState(products);

    const { auth } = usePage().props as any;
    const userRoles = auth?.roles || [];

    const [name, setName] = useState('');
    const [quantity, setQuantity] = useState(0);
    const [modalOpen, setModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [isDeleting, setIsDeleting] = useState(false);

    const [editProductId, setEditProductId] = useState<number | null>(null);
    const [modalEditOpen, setModalEditOpen] = useState(false);
    const [editName, setEditName] = useState('');
    const [editQuantity, setEditQuantity] = useState(0);
    const [isEditing, setIsEditing] = useState(false);

    const [manageProductId, setManageProductId] = useState<number | null>(null);
    const [manageType, setManageType] = useState('');
    const [modalManageOpen, setModalManageOpen] = useState(false);
    const [manageQuantity, setManageQuantity] = useState(0);
    const [isManage, setIsManage] = useState(false);

    const handleSubmit = async (event: SyntheticEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsSubmitting(true);
        let productName: string = '';

        try {
            const response = await axios.post('/api/products', {
                name,
                quantity,
            });

            setData(response.data.products);
            setModalOpen(false);
            setName('');
            setQuantity(0);

            productName = response.data.name;
        } catch (err: any) {
            if (err.response) {
                const errorData = err.response.data;

                if (errorData.status == 'error') {
                    return toast.error('Error Saving Product', {
                        description: errorData.message,
                    });
                }
            } else {
                return toast.error('Error Saving Product', {
                    description: 'Error unknown reason',
                });
            }
        } finally {
            setIsSubmitting(false);
        }

        return toast.success('Success To Save Product', {
            description: `The product with name ${productName} has been saved`,
        });
    };

    const handleDelete = (product: Product) => {
        setIsDeleting(true);

        toast('Are You Sure?', {
            description: `Are you sure to delete permanently product "${product.name}"?`,
            duration: Infinity,
            action: {
                label: 'Delete',
                onClick: () => {
                    const deletePromise = axios
                        .delete(`/api/products/${product.id}`)
                        .then((response) => {
                            if (
                                response.data.status &&
                                response.data.status === 'error'
                            ) {
                                throw new Error(
                                    response.data.message || 'Failed to delete',
                                );
                            }

                            setData(response.data.products);

                            return response.data;
                        });

                    toast.promise(deletePromise, {
                        loading: `Deleting product "${product.name}"...`,
                        success: (res) => {
                            return `The product with name ${res.name} is deleted`;
                        },
                        error: (err) => {
                            return err.message || 'Error Deleting Product';
                        },
                        finally: () => {
                            setIsDeleting(false);
                        },
                    });
                },
            },
            cancel: {
                label: 'Cancel',
                onClick: () => {
                    toast.dismiss();

                    return setIsDeleting(false);
                },
            },
        });
    };

    const triggerHandleEdit = (product: Product) => {
        setEditProductId(product.id);
        setEditName(product.name);
        setEditQuantity(product.quantity);
        setModalEditOpen(true);
    };

    const handleEdit = async (event: SyntheticEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsEditing(true);
        let productName: string = '';

        try {
            const response = await axios.patch(
                `/api/products/${editProductId}`,
                {
                    name: editName,
                    quantity: editQuantity,
                },
            );

            setData(response.data.products);
            setModalEditOpen(false);

            productName = response.data.name;
        } catch (err: any) {
            if (err.response) {
                const errData = err.response.data;

                if (errData.status === 'error') {
                    return toast.error('Error Editing Product', {
                        description: errData.message,
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

        return toast.success('Success Edited Product', {
            description: `Product with name "${productName}" has been edited`,
        });
    };

    const triggerHandleManage = (product: Product, type: 'In' | 'Out') => {
        setManageProductId(product.id);
        setManageType(type);
        setModalManageOpen(true);
    };

    const handleManage = async (event: SyntheticEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsManage(true);
        let productName = '';

        try {
            const response = await axios.patch(`/api/products/${manageProductId}`, {
                'quantity': manageQuantity,
                'type': manageType
            });

            setData(response.data.products);
            setModalManageOpen(false);

            productName = response.data.name;
        } catch (err: any) {
            if (err.response) {
                const errData = err.response.data;

                if (errData.status === 'error') {
                    return toast.error('Error Editing Product', {
                        description: errData.message,
                    });
                }
            } else {
                return toast.error('Error Editing Product', {
                    description: 'Error unknown reason',
                });
            }
        } finally {
            setIsManage(false);
        }
        
        return toast.success(`Success To Stock ${manageType} Product`, {
            description: `Success to manage stock with name "${productName}"`
        })
    };

    return (
        <>
            <Head title="Product" />
            <div className="flex w-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <DataTable
                    columns={columns}
                    data={data}
                    meta={{
                        isDeleting: isDeleting,
                        onDelete: handleDelete,
                        onEdit: triggerHandleEdit,
                        onManage: triggerHandleManage,
                        userRoles: userRoles,
                    }}
                    withSideSearchElement
                    sideSearchElement={
                        <ModalDialog
                            buttonIcon={<PlusCircleIcon />}
                            buttonText="Add Product"
                            title="Add Product"
                            btnTextSave="Save Product"
                            onSubmit={handleSubmit}
                            open={modalOpen}
                            onOpenChange={setModalOpen}
                            isSubmitting={isSubmitting}
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
                                <Label htmlFor="quantity">Quantity</Label>
                                <Input
                                    id="quantity"
                                    type="number"
                                    value={quantity}
                                    onChange={(e) =>
                                        setQuantity(Number(e.target.value))
                                    }
                                />
                            </Field>
                        </ModalDialog>
                    }
                />

                {userRoles.includes('Admin') && (
                    <ModalDialog
                        title="Edit Product"
                        btnTextSave="Update Product"
                        onSubmit={handleEdit}
                        open={modalEditOpen}
                        onOpenChange={setModalEditOpen}
                        isSubmitting={isEditing}
                        className="hidden"
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
                            <Label htmlFor="quantity">Quantity</Label>
                            <Input
                                id="quantity"
                                type="number"
                                value={editQuantity}
                                onChange={(e) =>
                                    setEditQuantity(Number(e.target.value))
                                }
                            />
                        </Field>
                    </ModalDialog>
                )}

                {userRoles.includes('Staff') && (
                    <ModalDialog
                        title={`Stock ${manageType} Product`}
                        btnTextSave={`Confirm stock ${manageType}`}
                        isSubmitting={isManage}
                        open={modalManageOpen}
                        onOpenChange={setModalManageOpen}
                        onSubmit={handleManage}
                        className="hidden"
                    >
                        <Input id="type" value={manageType} type="hidden" />
                        <Field>
                            <Label htmlFor="quantity">Quantity</Label>
                            <Input
                                id="quantity"
                                value={manageQuantity}
                                onChange={(e) =>
                                    setManageQuantity(Number(e.target.value))
                                }
                            />
                        </Field>
                    </ModalDialog>
                )}
            </div>
        </>
    );
}

Product.layout = {
    breadcrumbs: [
        {
            title: 'Product',
            href: product(),
        },
    ],
};
