//
//  ^^=name$$Model.h
//

#import "Item.h"
@interface ^^=$.ucfirst(argv)$$Model : Item

@property (nonatomic , copy) NSString * _id; 
^^for(var key in local.fields){var f = fields[key]$$
@property (nonatomic , copy) NSString * ^^=key$$; //^^=f.text$$
^^}$$
@end
