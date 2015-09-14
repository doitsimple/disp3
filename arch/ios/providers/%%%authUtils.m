#import "authUtils.h"
@implementation authUtils

+ (NSString *) getUserId
{
	^^=userSchema.name$$Model * ac = [[^^=userSchema.name$$Utils sharedDatabase] get];
	return ac.^^=userSchema.idField.name$$;
}
+ (NSString *) getToken {
	^^=tokenSchema.name$$Model * ac = [[^^=tokenSchema.name$$Utils sharedDatabase] get];
	return ac.^^=tokenSchema.tokenField.name$$;
};
+ (void) save: (NSString *)userid username:(NSString *)username token:(NSString *)token{
	^^=userSchema.name$$Model * ac = [[^^=userSchema.name$$Model alloc] init];
	ac.^^=userSchema.idField.name$$ = userid;
	ac.^^=userSchema.usernameField.name$$ = username;
	ac.^^=tokenSchema.tokenField.name$$ = token;
	[[^^=userSchema.name$$Utils sharedDatabase] save: ac];
}
@end
