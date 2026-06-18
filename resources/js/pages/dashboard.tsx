import { Head } from '@inertiajs/react';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import { dashboard } from '@/routes';
import {
    ChartConfig,
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
} from '@/components/ui/chart';
import {
    CartesianGrid,
    LabelList,
    Line,
    LineChart,
    XAxis,
    YAxis,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowDownRight, ArrowUpRight, Package } from 'lucide-react';

type dashboardPageProps = {
    chartData: object[];
    productsName: string[];
    productsCount: number;
    stockIn: number;
    stockOut: number;
    mutations: any[];
};

export default function Dashboard({
    chartData,
    productsName,
    productsCount,
    stockIn,
    stockOut,
    mutations,
}: dashboardPageProps) {
    const chartConfig: ChartConfig = {};
    const colorPalette = ['1', '2', '3', '4', '5'];

    productsName.forEach((name, index) => {
        const colorIndex = colorPalette[index % colorPalette.length];

        chartConfig[name] = {
            label: name,
            color: `hsl(var(--chart-${colorIndex}))`,
        };
    });

    return (
        <>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Produk
                            </CardTitle>
                            <Package className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {productsCount} Items
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Terdaftar aktif di sistem
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Barang Masuk (30 Hari)
                            </CardTitle>
                            <ArrowUpRight className="h-4 w-4 text-emerald-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-emerald-600">
                                +{stockIn}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Total kuantitas Stock In
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Barang Keluar (30 Hari)
                            </CardTitle>
                            <ArrowDownRight className="h-4 w-4 text-destructive" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-destructive">
                                -{stockOut}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Total kuantitas Stock Out
                            </p>
                        </CardContent>
                    </Card>
                    {/* <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                    </div>
                    <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                    </div> */}
                </div>
                <div className="grid gap-4 grid-cols-1 md:grid-cols-4">
                    <div className="col-span-1 md:col-span-3 rounded-xl border bg-background p-4">
                        <ChartContainer
                            config={chartConfig}
                            className=""
                        >
                            <LineChart data={chartData}>
                                <CartesianGrid />
                                <XAxis
                                    dataKey="date"
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={8}
                                />
                                <YAxis
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={10}
                                    domain={['auto', 'auto']}
                                />
                                <ChartTooltip
                                    cursor={false}
                                    content={<ChartTooltipContent />}
                                />
                                {productsName.map((name, index) => {
                                    const colorIndex =
                                        colorPalette[
                                            index % colorPalette.length
                                        ];

                                    return (
                                        <Line
                                            key={name}
                                            dataKey={name}
                                            type="monotone"
                                            stroke={`var(--chart-${colorIndex})`}
                                            strokeWidth={2}
                                            dot={{
                                                fill: `var(--chart-${colorIndex})`,
                                            }}
                                            activeDot={{ r: 4 }}
                                        >
                                            <LabelList
                                                position="top"
                                                offset={8}
                                                className="fill-foreground"
                                                fontSize={12}
                                            />
                                        </Line>
                                    );
                                })}
                                <ChartLegend content={<ChartLegendContent />} />
                            </LineChart>
                        </ChartContainer>
                    </div>
                    <div className="col-span-1 md:col-span-1 w-full rounded-xl border bg-background p-6">
                        <h3 className="mb-4 text-sm font-semibold">
                            Aktivitas Gudang Terbaru
                        </h3>
                        <div className="space-y-4">
                            {mutations.map((mutation) => (
                                <div
                                    key={mutation.id}
                                    className="flex items-center justify-between border-b pb-2 last:border-0"
                                >
                                    <div>
                                        <p className="text-sm font-medium">
                                            {mutation.product_name}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {mutation.date}
                                        </p>
                                    </div>
                                    <span
                                        className={`rounded-full px-2 py-1 text-xs font-semibold ${
                                            mutation.type === 'In'
                                                ? 'bg-emerald-100 text-emerald-700'
                                                : 'bg-red-100 text-red-700'
                                        }`}
                                    >
                                        {mutation.type === 'In'
                                            ? `+${mutation.amount}`
                                            : `-${mutation.amount}`}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};
