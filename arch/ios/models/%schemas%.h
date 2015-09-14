//
//  ^^=name$$Model.h
//

#import "Item.h"

@interface ^^=name$$Model : Item

^^fields.forEach(function(f){$$
@property (nonatomic , copy) NSString * ^^=f.name$$; //^^=f.text$$

^^})$$
@end
