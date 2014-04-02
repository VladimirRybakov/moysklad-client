/**
 * PO
 * Date: 14.03.14
 * Vitaliy V. Makeev (w.makeev@gmail.com)
 */

var PO = {
    name: 'PO',
    typeInfos: [
        {
            type: 'classInfo',
            localName: 'PurchaseOrderType',
            propertyInfos: [
                {
                    type: 'element',
                    name: 'shipTo',
                    elementName: 'shipTo',
                    typeInfo: 'PO.USAddress'
                },
                {
                    type: 'element',
                    name: 'billTo',
                    elementName: 'billTo',
                    typeInfo: 'PO.USAddress'
                },
                {
                    type: 'element',
                    name: 'comment',
                    elementName: 'comment',
                    typeInfo: 'String'
                },
                {
                    type: 'element',
                    name: 'items',
                    elementName: 'items',
                    typeInfo: 'PO.Items'
                },
                {
                    name: 'orderDate',
                    typeInfo: 'Calendar',
                    attributeName: 'orderDate',
                    type: 'attribute'
                }
            ]
        },
        {
            type: 'classInfo',
            localName: 'Items',
            propertyInfos: [
                {
                    type: 'element',
                    name: 'item',
                    collection: true,
                    elementName: 'item',
                    typeInfo: 'PO.Item'
                }
            ]
        },
        {
            type: 'classInfo',
            localName: 'USAddress',
            propertyInfos: [
                {
                    type: 'element',
                    name: 'name',
                    elementName: 'name',
                    typeInfo: 'String'
                },
                {
                    type: 'element',
                    name: 'street',
                    elementName: 'street',
                    typeInfo: 'String'
                },
                {
                    type: 'element',
                    name: 'city',
                    elementName: 'city',
                    typeInfo: 'String'
                },
                {
                    type: 'element',
                    name: 'state',
                    elementName: 'state',
                    typeInfo: 'String'
                },
                {
                    type: 'element',
                    name: 'zip',
                    elementName: 'zip',
                    typeInfo: 'Decimal'
                },
                {
                    name: 'country',
                    typeInfo: 'String',
                    attributeName: 'country',
                    type: 'attribute'
                }
            ]
        },
        {
            type: 'classInfo',
            localName: 'Item',
            propertyInfos: [
                {
                    type: 'element',
                    name: 'productName',
                    elementName: 'productName',
                    typeInfo: 'String'
                },
                {
                    type: 'element',
                    name: 'quantity',
                    elementName: 'quantity',
                    typeInfo: 'Int'
                },
                {
                    type: 'element',
                    name: 'usPrice',
                    elementName: 'USPrice',
                    typeInfo: 'Decimal'
                },
                {
                    type: 'element',
                    name: 'comment',
                    elementName: 'comment',
                    typeInfo: 'String'
                },
                {
                    type: 'element',
                    name: 'shipDate',
                    elementName: 'shipDate',
                    typeInfo: 'Calendar'
                },
                {
                    name: 'partNum',
                    typeInfo: 'String',
                    attributeName: 'partNum',
                    type: 'attribute'
                }
            ]
        }
    ],
    elementInfos: [
        {
            elementName: 'purchaseOrder',
            typeInfo: 'PO.PurchaseOrderType'
        },
        {
            elementName: 'comment',
            typeInfo: 'String'
        }
    ]
};
// If we're in node.js environment, export the mappings
if (typeof require === 'function') {
    module.exports.PO = PO;
}