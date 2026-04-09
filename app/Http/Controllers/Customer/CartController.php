<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Category;
use App\Models\Region;
use App\Models\Cart;
use App\Models\CartItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class CartController extends Controller
{
    /**
     * Get or create active DB cart for user
     */
    private function getActiveCart()
    {
        $user = Auth::user();
        if (!$user) return null;

        return Cart::firstOrCreate(
            ['user_id' => $user->id, 'status' => 'active']
        );
    }

    /**
     * Format cart to array shape expected by frontend [ 'product_id' => [ item_data ] ]
     */
    private function formatCartData($cartRecord)
    {
        $cartData = [];
        if ($cartRecord) {
            foreach ($cartRecord->items as $item) {
                if (!$item->product) continue;
                $product = $item->product;
                $cartData[(string)$product->id] = [
                    'id'        => $product->id, 
                    'product'   => $product->product,
                    'price'     => (float) $product->price,
                    'image_url' => $product->image_url,
                    'quantity'  => (int) $item->quantity,
                    'category'  => $product->category ? $product->category->toArray() : null,
                ];
            }
        }
        return $cartData;
    }

    /**
     * Show cart page with cart data from DB.
     */
    public function index()
    {
        $products = Product::with('category')
            ->where('status', 'active')
            ->latest()
            ->get();

        $categories = Category::orderBy('category')->get();

        $regions = Region::with(['provinces' => function($q) {
                $q->orderBy('provDesc');
            }, 'provinces.municipalities' => function($q) {
                $q->orderBy('citymunDesc');
            }, 'provinces.municipalities.barangays' => function($q) {
                $q->orderBy('brgyDesc');
            }])
            ->orderBy('regDesc')
            ->get();

        $user = Auth::user();
        $cartRecord = $this->getActiveCart();
        $cartRecord?->load(['items.product.category']);

        return Inertia::render('Cart', [
            'products'     => $products,
            'categories'   => $categories,
            'cart'         => $this->formatCartData($cartRecord),
            'regions'      => $regions,
            'savedAddress' => [
                'region_id'       => (string) ($user->region_id       ?? ''),
                'province_id'     => (string) ($user->province_id     ?? ''),
                'municipality_id' => (string) ($user->municipality_id ?? ''),
                'barangay_id'     => (string) ($user->barangay_id     ?? ''),
                'zipcode'         => $user->zip_code ?? '',
            ],
        ]);
    }

    /**
     * Add a product to the DB cart (or increase qty).
     */
    public function add(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity'   => 'required|integer|min:1',
        ]);

        $product = Product::findOrFail($request->product_id);
        $cart = $this->getActiveCart();

        if ($cart) {
            $item = CartItem::where('cart_id', $cart->id)
                            ->where('product_id', $product->id)
                            ->first();
            
            if ($item) {
                $item->quantity += $request->quantity;
                $item->save();
            } else {
                CartItem::create([
                    'cart_id' => $cart->id,
                    'product_id' => $product->id,
                    'quantity' => $request->quantity,
                ]);
            }
        }

        return back()->with('success', "'{$product->product}' added to cart.");
    }

    /**
     * Update quantity of a cart item in DB.
     */
    public function update(Request $request, $productId)
    {
        $request->validate(['quantity' => 'required|integer|min:1']);

        $cart = $this->getActiveCart();

        if ($cart) {
            $item = CartItem::where('cart_id', $cart->id)
                            ->where('product_id', $productId)
                            ->first();
            
            if ($item) {
                $item->quantity = $request->quantity;
                $item->save();
            }
        }

        return back()->with('success', 'Cart updated.');
    }

    /**
     * Remove a single item from the DB cart.
     */
    public function remove($productId)
    {
        $cart = $this->getActiveCart();

        if ($cart) {
            CartItem::where('cart_id', $cart->id)
                    ->where('product_id', $productId)
                    ->delete();
        }

        return back()->with('success', 'Item removed from cart.');
    }

    /**
     * Clear the entire DB cart.
     */
    public function clear()
    {
        $cart = $this->getActiveCart();

        if ($cart) {
            CartItem::where('cart_id', $cart->id)->delete();
        }

        return back()->with('success', 'Cart cleared.');
    }

    /**
     * JSON endpoint – returns current cart (for Axios calls).
     */
    public function get()
    {
        $cartRecord = $this->getActiveCart();
        $cartRecord?->load(['items.product.category']);
        return response()->json(['cart' => $this->formatCartData($cartRecord)]);
    }
}