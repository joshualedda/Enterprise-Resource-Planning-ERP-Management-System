<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage; // Import Storage facade
use Inertia\Inertia;

class ProductController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Inertia::render('Admin/Products/Index', [
            'products' => Product::with('category')->latest()->get(),
            'categories' => Category::withCount('products')->get(),
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(Product $product)
    {
        return Inertia::render('Admin/Products/Show', [
            'product' => $product->load('category'),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'product'     => 'required|string|max:150',
            'category_id' => 'required|exists:categories,id',
            'status'      => 'required|in:active,inactive',
            'price'       => 'required|numeric|min:0|max:99999999.99',
            'image'       => 'nullable|image|mimes:jpeg,jpg,png,webp|max:10240',
            'description' => 'nullable|string',
        ]);

        $imagePath = null;
        if ($request->hasFile('image')) {
            // Ito ay mapupunta sa: storage/app/public/product/random_name.jpg
            $imagePath = $request->file('image')->store('product', 'public');
        }

        Product::create([
            'product'     => $validated['product'],
            'category_id' => $validated['category_id'],
            'status'      => $validated['status'],
            'price'       => $validated['price'],
            'image_path'  => $imagePath,
            'description' => $validated['description'],
        ]);

        return redirect()->route('admin.products.index')->with('success', 'Product successfully added!');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Product $product)
    {
        $validated = $request->validate([
            'product'     => 'required|string|max:150',
            'category_id' => 'required|exists:categories,id',
            'status'      => 'required|in:active,inactive',
            'price'       => 'required|numeric|min:0|max:99999999.99',
            'image'       => 'nullable|image|mimes:jpeg,jpg,png,webp|max:10240',
            'description' => 'nullable|string',
        ]);

        // I-update ang basic fields
        $product->fill($validated);

        if ($request->hasFile('image')) {
            // 1. Burahin ang lumang image kung meron man sa storage
            if ($product->image_path) {
                Storage::disk('public')->delete($product->image_path);
            }
            
            // 2. I-save ang bagong image at i-update ang path
            $product->image_path = $request->file('image')->store('product', 'public');
        }

        $product->save();

        return redirect()->back()->with('success', 'Product updated successfully!');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Product $product)
    {
        // Siguraduhing mabura ang image file bago i-delete ang record
        if ($product->image_path) {
            Storage::disk('public')->delete($product->image_path);
        }
        
        $product->delete();
        
        return redirect()->route('admin.products.index')->with('success', 'Product deleted successfully!');
    }
}