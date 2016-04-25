//
//  ^^=name$$Model.m
//


#import "^^=$.ucfirst(argv)$$Model.h"

@implementation ^^=$.ucfirst(argv)$$Model
- (NSDictionary *)toDictionary:(^^=$.ucfirst(argv)$$Model *) model
{
    NSMutableDictionary *topicDict = [NSMutableDictionary dictionary];
    ^^for(var key in local.fields){var f = fields[key]$$
    if (model.^^=key$$) {
        [topicDict setValue:model.^^=key$$ forKey:@"^^=key$$"];
    }
    ^^}$$
    NSDictionary *dict = topicDict;
    return dict;
}
@end
