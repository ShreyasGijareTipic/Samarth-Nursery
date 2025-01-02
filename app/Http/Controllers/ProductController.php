<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\ProductMedia;
use App\Models\ProductSize;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Helpers\Util;
use Illuminate\Support\Facades\Auth;


class ProductController extends Controller
{
    
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
  
    public function index()
    {
        $user = Auth::user();
        
        // Fetch only products, media, and sizes that belong to the user's company
        $products = Product::where('company_id', $user->company_id)->get();
        $medias = ProductMedia::where('company_id', $user->company_id)->get();
        $sizes = ProductSize::where('company_id', $user->company_id)->get();
    
        $newProducts = array();
        foreach ($products as $product) {
            // Filter media and sizes by product_id
            $product->media = Util::getFilteredArray($product->id, $medias, 'product_id');
            $product->sizes = Util::getFilteredArray($product->id, $sizes, 'product_id');
            array_push($newProducts, $product);
        }
        
        return $newProducts;
    }
    
    /**
     * Display a all available products.
     *
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required',
            'localName'=>'required',
            'slug' => 'required',
            'categoryId' => 'required',
            'incStep' => 'required',
            'desc' => 'nullable',
            'multiSize' => 'required',
            'show' => 'required'
        ]);
    
        $user = Auth::user();
        
        // Create the product with company_id and created_by
        $product = Product::create([
            'name' => $request->name,
            'slug' => $request->slug,
            'categoryId' => $request->categoryId,
            'incStep' => $request->incStep,
            'desc' => $request->desc,
            'unit' => $request->unit,
            'multiSize' => $request->multiSize,
            'show' => $request->show,
            'showOnHome' => $request->showOnHome,
            'company_id' => $user->company_id, // Add company_id
            'created_by' => $user->id, // Add created_by
            'updated_by' => $user->id ,// Add updated by
            'localName'=> $request->localName,
        ]);
    
        // Save images with company_id and created_by
        $images = array();
        foreach ($request->media as $img) {
            $media = new ProductMedia;
            $media->url = $img['url'];
            $media->type = $img['type'];
            $media->company_id = $user->company_id; // Add company_id
          

            array_push($images, $media);
        }
        $product->media()->saveMany($images);
    
        // Save sizes with company_id and created_by
        $sizes = array();
        foreach ($request->sizes as $size) {
            $sz = new ProductSize;
            $sz->name = $size['name'];
            $sz->localName = $size['localName'];
            $sz->oPrice = $size['oPrice'];
            $sz->bPrice = $size['bPrice'];
            $sz->stock = $size['stock'];
            
            if ($size['dPrice']) {
                $sz->dPrice = $size['dPrice'];
            }
            $sz->qty = $size['qty'];
            $sz->show = $size['show'];
            $sz->company_id = $user->company_id; // Add company_id
            array_push($sizes, $sz);
        }
        $product->size()->saveMany($sizes);
    
        return $product;
    }
    

    /**
     * Store a new stock
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function newStock(Request $request)
    {
        //newStock
        $sizes = array();
        foreach($request->products as $product){
            foreach($product['sizes'] as $size){
                if(isset($size['id']) && isset($size['newStock'])){
                    ProductSize::where('id', $size['id'])
                    ->update([
                        'qty'=> DB::raw('qty+'.$size['newStock']),
                        'stock'=> DB::raw('stock+'.$size['newStock'])
                    ]);
                }
            }
        }
        return true;
    }

    /**
     * Store a new stock
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function stock(Request $request)
    {
        $user = Auth::user();
        // $sizes = ProductSize::where('company_id', $user->company_id)->get();
        $sizes = ProductSize::with('product:id,showOnHome') // Assuming you have a relationship defined in ProductSize
        ->where('company_id', $user->company_id)
        ->get();
        return $sizes;
    }

    /**
     * Display the specified resource.
     *
     * @param  integer $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        $product = Product::find($id);
        $product->media = $product->media;
        $product->sizes = $product->size;
        return $product;
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        $product = Product::find($id);
        $product->update($request->all());
        //Save images
        foreach($request->media as $img){
            if(isset($img['id'])){
                $media = ProductMedia::firstOrNew(array('id' => $img['id']));
                $media->id = $img['id'];
                $media->product_id = $img['product_id'];
                $media->url = $img['url'];
                $media->type = $img['type'];
                $media->show = $img['show'];
                $media ->save();
            }else{
                $media = new ProductMedia;
                $media->url = $img['url'];
                $media->type = $img['type'];
                $product->media()->save($media);
            }
        }

        // $sizes = array();
        foreach($request->sizes as $size){
            //print_r($img);
            if(isset($size['id'])){
                $sz = ProductSize::firstOrNew(array('id' => $size['id']));
                $sz->id = $size['id'];
                $sz->product_id = $size['product_id'];
                $sz->name = $size['name'];
                $sz->localName = $size['localName'];
                $sz->oPrice = $size['oPrice'];
                $sz->dPrice = $size['dPrice'];
                $sz->bPrice = $size['bPrice'];
                //$sz->stock =  $size['stock'];
                
                $sz->show = $size['show'];
                $sz->save();
            }else{
                $sz = new ProductSize;
                $sz->name = $size['name'];
                $sz->localName = $size['localName'];
                $sz->oPrice = $size['oPrice'];
                $sz->dPrice = $size['dPrice'];
                $sz->qty = $size['qty'];
                $sz->stock = $size['stock'];
                $sz->show = $size['show'];
                
                $product->sizes = $product->size()->save($sz);
            }
        }
        
        return $product;
    }


    public function updateQty(Request $request)
    {
        // Validate request inputs
        $request->validate([
            'id' => 'required|exists:product_sizes,id',
            'qty' => 'required|integer|min:0',
            // 'show' => 'nullable|integer'
        ]);
        
        $productSize = ProductSize::find($request->id);
        // $products = Product::find($request->id);
        
        if ($productSize ) {
            // Update quantity if provided
            if ($request->filled('qty')) {
                $productSize->qty = $productSize->qty + $request->qty;
                //TODO: stock update
            }

            // Save the updated product size
            $productSize->save();
        
            $productSize = ProductSize::find($request->id);

            return response()->json([
                'success' => true,
                'message' => 'Quantity updated successfully.',
                'product' => $productSize,
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Product size not found.'
        ], 404);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  integer  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        Product::destroy($id);
        return ProductSize::where('product_id',$id)->delete();
    }
}
