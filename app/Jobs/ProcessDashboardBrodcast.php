<?php

namespace App\Jobs;

use App\Events\StockMutationCreated;
use App\Models\StockMutations;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class ProcessDashboardBrodcast implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    public function __construct()
    {
        //
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $products = DB::table('products')->get(['id', 'name', 'quantity']);
        $productsCount = $products->count();

        $currentStocks = [];
        $productNames = [];
        foreach ($products as $p) {
            $currentStocks[$p->id] = (int) $p->quantity;
            $productNames[$p->id] = $p->name;
        }

        $startDate = Carbon::now()->subDays(30)->startOfDay();
        $mutations = DB::table('stock_mutations')
            ->where('created_at', '>=', $startDate)
            ->orderBy('created_at', 'desc')
            ->get(['product_id', 'type', 'amount', 'created_at']);

        $StockIn = 0;
        $StockOut = 0;

        $mutations->map(function ($mutation) use (&$StockIn, &$StockOut) {
            if ($mutation->type === 'In') {
                return $StockIn += $mutation->amount;
            } else {
                $StockOut += $mutation->amount;
            }
        });

        $groupedMutations = $mutations->groupBy(function ($item) {
            return Carbon::parse($item->created_at)->format('Y-m-d');
        });

        $chartData = [];

        for ($i = 0; $i <= 30; $i++) {
            $currentDateObj = Carbon::now()->subDays($i);
            $dateKey = $currentDateObj->format('Y-m-d');
            $dateLabel = $currentDateObj->format('d/m/Y');

            $row = ['date' => $dateLabel];
            foreach ($productNames as $id => $name) {
                $row[$name] = max(0, $currentStocks[$id]);
            }
            $chartData[] = $row;

            if ($groupedMutations->has($dateKey)) {
                foreach ($groupedMutations[$dateKey] as $mutation) {
                    $pId = $mutation->product_id;
                    if (isset($currentStocks[$pId])) {
                        if ($mutation->type === 'In') {
                            $currentStocks[$pId] -= $mutation->amount;
                        } else {
                            $currentStocks[$pId] += $mutation->amount;
                        }
                    }
                }
            }
        }

        $formattedData = array_reverse($chartData);

        $mutationsHistory = StockMutations::with('product')->orderBy('created_at', 'desc')->limit(8)->get()->map(function ($mutation) {
            return [
                'id'=>$mutation->id,
                'product_name'=>$mutation->product->name,
                'type'=>$mutation->type,
                'amount'=>$mutation->amount,
                'date'=>$mutation->created_at->format('d/m/Y'),
            ];
        });

        $freshData = [
            'chartData'     => $formattedData,
            'productsName'  => array_values($productNames),
            'productsCount' => $productsCount,
            'stockIn'       => $StockIn,
            'stockOut'      => $StockOut,
            'mutations'     => $mutationsHistory,
        ];

        broadcast(new StockMutationCreated($freshData))->toOthers();
    }
}
