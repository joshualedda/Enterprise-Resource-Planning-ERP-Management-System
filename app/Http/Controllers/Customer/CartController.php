<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Category;
use App\Models\Region;
use App\Models\UserInformation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class CartController extends Controller
{
    /**
     * Show customer browse-products page with cart data from session.
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

        // Fetch saved address for auto-fill on delivery checkout from user
        $user = Auth::user();

        return Inertia::render('Customer/Products/Index', [
            'products'     => $products,
            'categories'   => $categories,
            'cart'         => session('cart', []),
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
     * Add a product to the session cart (or increase qty).
     */
    public function add(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity'   => 'required|integer|min:1',
        ]);

        $product = Product::findOrFail($request->product_id);
        $cart    = session('cart', []);
        $id      = (string) $product->id;

        if (isset($cart[$id])) {
            $cart[$id]['quantity'] += $request->quantity;
        } else {
            $cart[$id] = [
                'id'        => $product->id,
                'product'   => $product->product,
                'price'     => (float) $product->price,
                'image_url' => $product->image_url,
                'quantity'  => $request->quantity,
            ];
        }

        session(['cart' => $cart]);

        return back()->with('success', "'{$product->product}' added to cart.");
    }

    /**
     * Update quantity of a cart item.
     */
    public function update(Request $request, $productId)
    {
        $request->validate(['quantity' => 'required|integer|min:1']);

        $cart = session('cart', []);
        $id   = (string) $productId;

        if (isset($cart[$id])) {
            $cart[$id]['quantity'] = $request->quantity;
            session(['cart' => $cart]);
        }

        return back()->with('success', 'Cart updated.');
    }

    /**
     * Remove a single item from the cart.
     */
    public function remove($productId)
    {
        $cart = session('cart', []);
        unset($cart[(string) $productId]);
        session(['cart' => $cart]);

        return back()->with('success', 'Item removed from cart.');
    }

    /**
     * Clear the entire cart.
     */
    public function clear()
    {
        session()->forget('cart');
        return back()->with('success', 'Cart cleared.');
    }

    /**
     * JSON endpoint – returns current cart (for Axios calls).
     */
    public function get()
    {
        return response()->json(['cart' => session('cart', [])]);
    }
}