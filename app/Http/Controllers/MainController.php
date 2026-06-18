<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\StockMutations;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class MainController extends Controller
{
    public function dashboard()
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

        return Inertia::render('dashboard', [
            'chartData' => $formattedData,
            'productsName' => array_values($productNames),
            'productsCount' => $productsCount,
            'stockIn' => $StockIn,
            'stockOut' => $StockOut,
            'mutations' => $mutationsHistory,
        ]);
    }

    public function product()
    {
        $products = Product::all()->toArray();
        // dd($products);
        return Inertia::render('product', [
            'products' => $products
        ]);
    }

    public function users()
    {
        $users = User::with('roles:name')->get()->map(function ($user) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->roles()->first()?->name ?? 'No Role',
            ];
        });
        // dd($users);
        return Inertia::render('users', [
            'users' => $users
        ]);
    }
}
