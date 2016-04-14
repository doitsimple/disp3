//
//  ^^=name$$Model.h
//

#import "Item.h"
@interface ^^=$.ucfirst(argv)$$Model : Item

^^for(var key in local.fields){var f = fields[key]$$
@property (nonatomic , copy) NSString * ^^=key$$; //^^=f.text$$
^^}$$
@end
