# jq-Repeater
After a lot of hours spent in writing html code inside javascript files i decided that would be useful have a tool that permit to bind array of javascript objects directly inside html.

From this borns jq-Repeater a simple but featured plugin that permit, like angular do, to build a list of html elements from javascript objects writing object's properties directly inside the html file and to retrieve modified objects without writing lines and lines of code.

* **Awesome for creating datatables or any kind of list**

##Features:
* Two way data binding (**simply edit object values directly from html without writing even a line of code!**)
* Simple to use and to make it work
* Lot of attributes to reach every need
* Nested repeaters
* Customizable pagination
* Customizable filter
* Very small (about 12kb minified) and very fast to render
* Costantly updated with new features and improvements
* Other...

##Download:
```
BOWER: $ bower install jq-repeater
```
 
##Example: 
###JS:
```JavaScript
/// OPTIONAL EVENTS
 $(document).on('RenderFinish', function () { })
 $(document).on('Filtered', function (e, colName, elNumber) { console.log(colName + '[' + elNumber + ']'); });
 $(document).on('ValueChanged', function (newVal, propName, obj, oldVal, objIndex) { console.log(newVal) })
 ///
 
 new jqRepeater('hide') // optional hide class
 .bind({
     items:
     [
         { name: 'el1', ID: 1, checked: false },
         { name: 'el2', ID: 2, checked: true },
         { name: 'el3', ID: 3, checked: false },
         { name: 'el4', ID: 4, checked: true }
     ]
 });
```
###HTML:
```HTML
<input type="text" id="txt_filter" class="form-control" placeholder="Find.." />
<div jq-repeater="item in items" jq-filter="name:#txt_filter" jq-pagination-rows="2">
    <div class="col-md-1">
        {{$index+1}})
    </div>
    <div class="col-md-3" jq-class="text-danger:{{$item.checked}}">
        Name:<span jq-model="{{$item.name}}"></span>
        <span jq-show="{{$item.checked}}" >[Editable]</span>
    </div>
    <div class="col-md-3">
        <input type="text" jq-model="{{$item.name}}" jq-disabled="{{_!$item.checked}}" class="form-control" />
    </div>
    <div class="col-md-2">
        <input type="checkbox" jq-model="{{$item.checked}}" />
    </div>
    <div class="col-md-3">
        <a href="javascript:;" jq-remove="{{$index}}" class="btn btn-danger">REMOVE</a>
    </div>
</div>
```
###[jsFiddle](https://jsfiddle.net/65mztk26/16/)

##Documentation: 
####Example of use:
```$.getJSON("handler", function(data) {```
``` new jqRepeater().bind({ items: data });```
```}); ```

####Content selector: ```jq-repeater="item in items"``` (take all the content of element)

* ```item``` => identifier for the main object (can be anything)
* ```items``` => collection name (can be anything)

####Filter: ```jq-filter="fieldName:controlSelector,fieldName1:controlSelector1"```
* multiple filter using comma
* array search
* concurrent filters using ```jq-filter-multiple="true"``` attribute

#####Filter on:
* single field 
* all field using star '*' even on sub object or specify sublevel of search with brackets and level of sub search after star '[1]' 
* all field except someone using star '*' and braces with field to avoid separated by semicolon (*{field1;field2}) 
* some field using braces separated by semicolon ({field1;field2}) 

####Pagination: jq-pagination-
* ```rows```: rowsNumber
* ```container```: "paginationContainerSelector"

###Supported expressions:
####Selectors:
* {{*any evaluable expression*}}
* {{selector.property}} or {{selector.property.subproperty}} for unobserved properties
* {{$selector.property}} or {{$selector.property.subproperty}} for observed properties ( _!$selector for opposite)
* Nested repeater support with # for each level:
 * 1st level: {{#selector.property}} 
 * 2nd level: {{##$selector.property}}
 * 3rd level: (...) etc

|Variable|Type|Details
|--------|---------|-------|
|```$index```|**number**|return the index of the element|
|```$first```|**boolean**|return true if the element is the first of collection|
|```$last```|**boolean**|return true if the element is the last of collection|
|```$middle```|**boolean**|return true if the element is in the mid of collection|
|```$odd```|**boolean**|return true if element has a odd index|
|```$even```|**boolean**|return true if element has a even index|

#####Examples: 
* ```{{$index}}```
* ```{{$index+1}}```
* ```{{$last}}```
* ```{{selector.stringProp.substring(0, 5)}}```

####Tags:
|Attribute|Binded properties|Expression
|--------|---------|-------|
|```jq-checked```|$selector|bool expr or selector.boolProp|
|```jq-selected```|$selector|string expr or selector.stringProp|
|```jq-disabled```|$selector|bool expr or selector.boolProp|
|```jq-readonly```|$selector|bool expr or selector.boolProp|
|```jq-show```|$selector|bool expr or selector.boolProp|
|```jq-render```| - |bool expr or selector.boolProp|
|```jq-class```|[classname: $selector]|[classname: bool expr or selector.boolProp]|
|```jq-remove```|$index|number expr|
|```jq-model```|$selector|-|

#####Examples: 
* ```jq-checked="{{$selector.boolProperty}}"```
* ```jq-disabled="{{_!$selector.boolProperty}}"```
* ```jq-readonly="{{$index+1==2}}"```
* ```jq-class="active:{{$selector.boolProperty}}, firstClass:{{$first}}"```
* ```jq-model="{{$selector.boolProperty}}"```
 
###Methods:
* **bind**: function ({collections}, {collectionsOptions}?)

create the repeater elements
* **update**: function ('collectionName', [newCollection])

update the repeater
* **addElements**: function ('collectionName', [newElements])

add elements to collection and update the repeater
* **removeElement**: function ('collectionName', index)

remove element from collection and update the repeater
* **getCollectionElement**: function ('collectionName', index)

return a object from the collection
* **setCollectionElement**: function ('collectionName', index, {newObject})

set an object of the collection
* **getCollection**: function ('collectionName')

set the callback function called when a object's property is updated
* **changePropertyValue**: function ('collectionName', elIndex, 'fullPropName', newValue)

filter the collection
* **filterElements**: function ('collectionName', 'searchField', 'value')

change value of object property

###Events:
* Rendered (collectionName, isFiltered)
* RenderFinish ()
* ValueChanged (newValue, propertyName, editedObject, oldValue, itemIndex)
* CollectionUpdated (collectionName)
* Filtered (collectionName, itemsFilterNumber)

##Require:
* jQuery

##Size minified: 
12.5 KB
