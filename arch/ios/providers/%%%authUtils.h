#import "^^=global.userSchema.name$$Utils.h"

@interface authUtils : NSObject
+ (NSString *) getUserId;
+ (NSString *) getToken;
+ (void) save: (NSString *)userid username:(NSString *)username token:(NSString *)token;
@end
