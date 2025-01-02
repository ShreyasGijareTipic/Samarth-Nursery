<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Category;
use App\Models\SubCategory;
use App\Models\SubSubCategory;
use Illuminate\Support\Facades\Auth;
use App\Helpers\Util;

class CategoryController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $user = Auth::user();
        return Category::where('company_id', $user->company_id)->get();
    }

    /**
     * Display all available categories and subcategories.
     *
     * @return \Illuminate\Http\Response
     */
    public function categories()
    {
        $user = Auth::user();

        $categories = Category::where('company_id', $user->company_id)
                              ->where('show', true)
                              ->get();

        $subCategory = SubCategory::where('show', true)->get();
        $subSubCategory = SubSubCategory::where('show', true)->get();

        $mappedCategories = array();
        foreach ($categories as $category) {
            $subCategories = Util::getFilteredArray($category->id, $subCategory, 'categoryId');
            foreach ($subCategories as $subCategory) {
                $subCategory->subSubCategory = Util::getFilteredArray($subCategory->id, $subSubCategory, 'subCategoryId');
            }
            $category->subCategory = $subCategories;
            array_push($mappedCategories, $category);
        }
        return $mappedCategories;
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $user = Auth::user();

        $request->validate([
            'name' => 'required',
            'localName' => 'required',
            'image' => 'required',
            'show' => 'required'
        ]);


        $Category = Category::create([
            'name'=> $request['name'],
            'localName'=> $request['localName'],
            'image'=> $request['image'],
            'show'=> $request['show'],
            'slug'=>$request['name'],
            'company_id'=> $user->company_id
           
        ]);

       
        return $Category;
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        $user = Auth::user();
        return Category::where('id', $id)
            ->where('company_id', $user->company_id)
            ->firstOrFail();
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
        $user = Auth::user();

        $request->validate([
            'name' => 'required',
            'localName' => 'required',
            'image' => 'required',
            'show' => 'required'
        ]);

        $category = Category::where('id', $id)
            ->where('company_id', $user->company_id)
            ->firstOrFail();

        $category->update($request->all());

        return $category;
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        $user = Auth::user();

        $category = Category::where('id', $id)
            ->where('company_id', $user->company_id)
            ->firstOrFail();

        return $category->delete();
    }
}
