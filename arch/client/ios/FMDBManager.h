//
//  FMDBManager.h
//  ECSDKDemo_OC
//
//  Created by DeveloperIOS on 16/5/20.
//  Copyright © 2016年 ronglian. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "FMDatabase.h"

@interface FMDBManager : NSObject
+ (FMDBManager *)getInstance;
- (FMDatabase *)database;
- (int)getDatabaseSchemaVersion;
- (void)setDatabaseSchemaVersion:(int)version;
- (void)dropDatabase;
@end
