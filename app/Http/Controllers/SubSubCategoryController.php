<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\SubSubCategory;

class SubSubCategoryController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        return SubSubCategory::all();
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $request->validate([
            'categoryId'=>'required',
            'subCategoryId'=>'required',
            'name'=> 'required',
            'localName'=> 'required',
            'image'=> 'required',
            'show'=> 'required'
        ]);
        return SubSubCategory::create($request->all());
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        return SubSubCategory::find($id);
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
        $request->validate([
            'categoryId'=>'required',
            'subCategoryId'=>'required',
            'name'=> 'required',
            'localName'=> 'required',
            'image'=> 'required',
            'show'=> 'required'
        ]);
        $subCategory = SubSubCategory::find($id);
        $subCategory->update($request->all());
        return $subCategory;
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        return SubSubCategory::destroy($id);
    }
}
