<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Category;
use Illuminate\Http\Request;

use Illuminate\Support\Facades\File;
use Inertia\Inertia;

class ProductController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Products/Index', [
            'products' => Product::with('category')->latest()->get(),
            'categories' => Category::withCount('products')->get(),
        ]);
    }

    public function show(Product $product)
    {
        return Inertia::render('Admin/Products/Show', [
            'product' => $product->load('category'),
            // 'categories' => Category::all(), // Not strictly needed for read-only view unless implicit editing
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'nullable', // Handle possible mismatch if frontend sends 'title' or 'name', but we need 'product'
            'product' => 'required|string|max:150', // Renamed back to product
            'category_id' => 'required|exists:categories,id',
            'status' => 'required|in:active,inactive', // String status
            'price' => 'required|numeric|min:0|max:99999999.99',
            'image' => 'nullable|image|mimes:jpeg,jpg,png,webp|max:10240',
            'description' => 'nullable|string', 
        ]);

        $imagePath = null;
        if ($request->hasFile('image')) {
            $file = $request->file('image');
            $filename = time() . '_' . $file->getClientOriginalName();
            $file->move(public_path('img'), $filename);
            $imagePath = 'img/' . $filename;
        }

        Product::create([
            'product' => $validated['product'],
            'category_id' => $validated['category_id'],
            'status' => $validated['status'],
            'price' => $validated['price'],
            'image_path' => $imagePath,
            'description' => $validated['description'],
        ]);

        return redirect()->route('admin.products.index')->with('success', 'Product successfully added!');
    }

    public function update(Request $request, Product $product)
    {
        $validated = $request->validate([
            'product' => 'required|string|max:150',
            'category_id' => 'required|exists:categories,id',
            'status' => 'required|in:active,inactive',
            'price' => 'required|numeric|min:0|max:99999999.99',
            'image' => 'nullable|image|mimes:jpeg,jpg,png,webp|max:10240',
            'description' => 'nullable|string',
        ]);

        $product->product = $validated['product'];
        $product->category_id = $validated['category_id'];
        $product->status = $validated['status'];
        $product->price = $validated['price'];
        $product->description = $validated['description'];

        if ($request->hasFile('image')) {
            if ($product->image_path && File::exists(public_path($product->image_path))) {
                File::delete(public_path($product->image_path));
            }
            
            $file = $request->file('image');
            $filename = time() . '_' . $file->getClientOriginalName();
            $file->move(public_path('img'), $filename);
            $product->image_path = 'img/' . $filename;
        }

        $product->save();

        return redirect()->back()->with('success', 'Product updated successfully!');
    }



    public function destroy(Product $product)
    {
        if ($product->image_path && File::exists(public_path($product->image_path))) {
            File::delete(public_path($product->image_path));
        }
        
        $product->delete();
        
        return redirect()->route('admin.products.index')->with('success', 'Product deleted successfully!');
    }
}