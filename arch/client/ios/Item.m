//
//  Item.m
//

#import "Item.h"

@implementation Item

- (void)setValue:(id)value forUndefinedKey:(NSString *)key
{
}
- (void)setValue:(id)value forKey:(NSString *)key
{
	if ([key isKindOfClass:[NSString class]] == YES) {
		[super setValue:value forKey:key];
	}else{
		[super setValue:[NSString stringWithFormat:@"%@" , value] forKey:key];
	}
}
@end
