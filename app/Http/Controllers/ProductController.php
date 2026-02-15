<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ProductController extends Controller
{
    public function index()
    {
        return Inertia::render('Products/Index', [
            'products' => Product::with('category')->latest()->get(),
            'categories' => Category::withCount('products')->get(),
        ]);
    }

    public function show(Product $product)
    {
        return Inertia::render('Products/Show', [
            'product' => $product->load('category'),
            'categories' => Category::all(),
            'description' => $product->description, // Idagdag ito para maipasa ang description sa view
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'product' => 'required|string|max:150',
            'category_id' => 'required|exists:categories,id',
            'status' => 'required|in:active,inactive',
            'price' => 'required|numeric|min:0|max:99999999.99',
            'image' => 'nullable|image|mimes:jpeg,jpg,png,webp|max:2048',
            'description' => 'nullable|string|max:500', // Idagdag ito para i-validate ang description
        ]);

        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('products', 'public');
        }

        Product::create([
            'product' => $validated['product'],
            'category_id' => $validated['category_id'],
            'status' => $validated['status'],
            'price' => $validated['price'],
            'image_path' => $imagePath,
            'description' => $validated['description'], // Idagdag ito para ma-save ang description
        ]);

        return redirect()->route('products.index')->with('success', 'Product successfully added!');
    }

    public function update(Request $request, Product $product)
    {
        $validated = $request->validate([
            'product' => 'required|string|max:150',
            'category_id' => 'required|exists:categories,id',
            'status' => 'required|in:active,inactive',
            'price' => 'required|numeric|min:0|max:99999999.99',
            'image' => 'nullable|image|mimes:jpeg,jpg,png,webp|max:2048',
            'description' => 'nullable|string|max:500', // Idagdag ito para i-validate ang description
        ]);

        $product->product = $validated['product'];
        $product->category_id = $validated['category_id'];
        $product->status = $validated['status'];
        $product->price = $validated['price'];
        $product->description = $validated['description'];

        if ($request->hasFile('image')) {
            if ($product->image_path && Storage::disk('public')->exists($product->image_path)) {
                Storage::disk('public')->delete($product->image_path);
            }
            $product->image_path = $request->file('image')->store('products', 'public');
        }

        $product->save();

        return redirect()->back()->with('success', 'Product updated successfully!');
    }

    public function destroy(Product $product)
    {
        if ($product->image_path && Storage::disk('public')->exists($product->image_path)) {
            Storage::disk('public')->delete($product->image_path);
        }
        
        $product->delete();
        
        return redirect()->route('products.index')->with('success', 'Product deleted successfully!');
    }
}