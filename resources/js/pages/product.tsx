import { Head } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown } from 'lucide-react';
import { useEffect, useState } from 'react';
import { DataTable } from '@/components/data-table';
import { Button } from '@/components/ui/button';
import { product } from '@/routes';

type Product = {
    id: number;
    name: string;
    quantity: number;
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
        cell: ({ row }) => {
            const product = row.original;

            return (
                <div>
                    <Button onClick={() => {
                        alert('test' + String(product.id))
                        }}>test</Button>
                </div>
            );
        },
    },
];

async function getData(): Promise<Product[]> {
    return [
        {
            id: 1,
            name: 'Tas',
            quantity: 40,
        },
        {
            id: 2,
            name: 'Jaket',
            quantity: 30,
        },
        {
            id: 3,
            name: 'Baju',
            quantity: 35,
        },
        {
            id: 4,
            name: 'Sepatu',
            quantity: 105,
        },
    ];
}

export default function Product() {
    const [data, setData] = useState<Product[]>([]);

    useEffect(() => {
        getData().then(setData);
    }, []);

    return (
        <>
            <Head title="Product" />
            <div className="flex w-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <DataTable columns={columns} data={data} withAddButton={true} addButtonText='Add Product'/>
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
