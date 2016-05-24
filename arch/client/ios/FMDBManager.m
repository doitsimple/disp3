//
//  FMDBManager.m
//  ECSDKDemo_OC
//
//  Created by DeveloperIOS on 16/5/20.
//  Copyright © 2016年 ronglian. All rights reserved.
//

#import "FMDBManager.h"

static int databaseVersion = 1;

@implementation FMDBManager
{
    FMDatabase *_database;
}

+ (FMDBManager *)getInstance
{
    static FMDBManager *manager;
    @synchronized(self){
        if (manager == nil) {
            manager = [[FMDBManager alloc] init];
        }
    }
    return manager;
}

- (FMDatabase *)database
{
    //数据库修改重新设置版本号设置数据库版本号
//    [self setDatabaseSchemaVersion:2];
    if(!_database){
        NSString * databasePath = [NSHomeDirectory() stringByAppendingPathComponent:@"Documents/yangold.db"];
        _database = [FMDatabase databaseWithPath:databasePath];
        BOOL ret = [_database open];
        if (ret == NO) {
            NSLog(@"数据库连接失败");
            exit(-1);
        }
        else
        {
            //连接上数据库后，请确认是否有表结构修改。更新数据库版本号。
            [self migrateDatabase];
        }
    }
    return _database;
}

- (void)dropDatabase
{
    if ([self database]) {
        [_database executeUpdate:@"DROP DATABASE yangold.db"];
        [_database close];
    }
}

- (int)getDatabaseSchemaVersion
{
    FMResultSet *resultSet = [[self database] executeQuery:@"PRAGMA database_version"];
    int version = 0;
    if ([resultSet next]) {
        version = [resultSet intForColumnIndex:0];
    }
    return version;
}

- (void)setDatabaseSchemaVersion:(int)version {
    // FMDB cannot execute this query because FMDB tries to use prepared statements
    sqlite3_exec([self database].sqliteHandle,[[NSString stringWithFormat:@"PRAGMA database_version = %d",version] UTF8String], NULL, NULL, NULL);
}


- (void)migrateDatabase {
    int version = [self getDatabaseSchemaVersion];
    if (version >= databaseVersion)
        return;
    
    if (version < databaseVersion) {
        [self dropDatabase];
    }
    
    [self setDatabaseSchemaVersion:databaseVersion];
}
@end
