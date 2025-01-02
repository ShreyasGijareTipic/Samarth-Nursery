<?php
namespace App\Helpers;
 
class Util {
    /**
     * @param object $value
     * @param object $data
     * 
     * @return object
     */
    public static function getFilteredArray($value, $data, $key) {
        $filtredArray = array();
        foreach($data as $index => $item) {
            if(isset($item[$key])) {
                if($item[$key] == $value ){
                    $item->children= array();
                    array_push($filtredArray, $item);
                }
            }
        }
        return $filtredArray;
     }
}