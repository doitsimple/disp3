^^
var idFieldName = "_id";
var model = $.ucfirst(argv)+"Model";
var provider = $.ucfirst(argv)+"Provider";
if(!local.fields) local.fields = {};
$$
^^
function getTypePairs(){
  var str = "";
	var arr = Object.keys(local.fields);
	for(var i in arr){
		var f = fields[arr[i]];
		if(i != 0)
			str += ", ";
    str += arr[i] + " " + "TEXT";//global.dbdef.getType(f, "sqlite");
  	if(i == 0)
			str += " PRIMARY KEY";
	}
  return str;
}
function getCols(){
  var str = "";
	var arr = Object.keys(local.fields);
	for(var i in arr){
		var f = fields[arr[i]];
      if(i != 0)
				str += ", ";
      str += arr[i];
	}
  return str;
}
function getQuerys(){
  var str = "";
	for(var i in Object.keys(local.fields)){
      if(i != 0)
				str += ", ";
      str += "?";
	}
  return str;
}
function getItemList(){
  var str = "";
	var arr = Object.keys(local.fields);
	for(var i in arr){
		var f = fields[arr[i]];
      if(i != 0)
				str += ", ";
      str += "item." + arr[i];
	}
  return str;
}

$$
//
//

#import "^^=provider$$.h"

@implementation ^^=provider$$
{
    //database
    FMDatabase * _database;
}

- (id)init
{
    if (self = [super init]) {
        //创建数据库，打开数据库，创建表单
        _database = [[FMDBManager getInstance] database];
        
        //创建表单
        NSString * sql = @"CREATE TABLE IF NOT EXISTS ^^=argv$$(^^=getTypePairs()$$);";
        BOOL retN = [_database executeUpdate:sql];
        if (retN == NO) {
            NSLog(@"创建表单错误!");
        }
    }
    return self;
}

//添加对象
- (void)addItem:(^^=model$$ *)item
{
    NSString * sql = @"INSERT INTO ^^=argv$$(^^=getCols()$$) VALUES(^^=getQuerys()$$);";
    
    //将不是字符串的数据，转成字符串，因为通配符需要用字符串来填充
    
    @synchronized(self){
        //调用SQL，保存数据到表单
      	BOOL ret = [_database executeUpdate:sql, ^^=getItemList()$$];
        if (ret == NO) {
            NSLog(@"插入错误");
        }
    }
}

//删除一个记录
- (void)deleteById:(NSString *)ID
{
    NSString * sql = @"DELETE FROM ^^=argv$$ WHERE ^^=idFieldName$$ = ?;";
    @synchronized(self){
        BOOL ret = [_database executeUpdate:sql, ID];
        if (ret == NO) {
            NSLog(@"删除失败");
        }
    }
}


//查找所有对象
- (NSArray *)list
{
    //将数据库中，查找到的记录，创建成对应对象，然后装到数组中返回
	NSString * sql = @"SELECT * FROM ^^=argv$$;";
    FMResultSet * set;
    @synchronized(self){
        //找出所有记录

			set = [_database executeQuery:sql];
    }
    
    //根据记录，创建对象
    NSMutableArray * array = [NSMutableArray array];
    while ([set next]) {
        ^^=model$$ *item = [[^^=model$$ alloc] init];
	^^for(var key in fields){var f = fields[key];$$
        item.^^=key$$ = [set stringForColumn:@"^^=key$$"];
	^^}$$
        [array addObject: item];
    }
    
    return array;
}
- (NSArray *)list:(NSString *)where
{
NSString * sql = [NSString stringWithFormat:@"SELECT * FROM ^^=argv$$ WHERE %@;", where];
    FMResultSet * set;
    @synchronized(self){
        //找出所有记录
	set = [_database executeQuery:sql];
    }
    
    //根据记录，创建对象
    NSMutableArray * array = [NSMutableArray array];
    while ([set next]) {
        ^^=model$$ *item = [[^^=model$$ alloc] init];
	^^for(var key in fields){var f = fields[key];$$
        item.^^=key$$ = [set stringForColumn:@"^^=key$$"];
	^^}$$
        [array addObject: item];
    }
    
    return array;
}
^^if(fields.user_id){$$
- (NSArray *)listByUser:(NSString *)userID
{
    //将数据库中，查找到的记录，创建成对应对象，然后装到数组中返回
NSString * sql = @"SELECT * FROM ^^=argv$$ WHERE user_id = ?;";
    FMResultSet * set;
    @synchronized(self){
        //找出所有记录

			set = [_database executeQuery:sql, userID];
    }
    
    //根据记录，创建对象
    NSMutableArray * array = [NSMutableArray array];
    while ([set next]) {
        ^^=model$$ *item = [[^^=model$$ alloc] init];
	^^for(var key in fields){var f = fields[key];$$
        item.^^=key$$ = [set stringForColumn:@"^^=key$$"];
	^^}$$
        [array addObject: item];
    }
    
    return array;
}
^^}$$
//查找指定对象
- (^^=model$$ *)getById:(NSString *)ID
{
    NSString * sql = @"SELECT * FROM ^^=argv$$ WHERE ^^=idFieldName$$ = ?;";
    FMResultSet * set;
    @synchronized(self){
        set = [_database executeQuery:sql, ID];
    }
    
    //如果找不到，返回空
    if (set.next == NO) {
        return nil;
    }

    ^^=model$$ *item = [[^^=model$$ alloc] init];

^^for(var key in fields){var f = fields[key];$$
    item.^^=key$$ = [set stringForColumn:@"^^=key$$"];
^^}$$
    
    return item;
}

- (void)upsertById:(NSString *)ID ^^=argv$$:(^^=model$$ *)updateItem
{
	^^=model$$ * item = [self getById:ID];

	if (item.^^=idFieldName$$ == NULL) {
		updateItem.^^=idFieldName$$ = ID;
		[self addItem:updateItem];
	}else{
		NSMutableString * string  = [[NSMutableString alloc] init];
		NSMutableString * muString = [[NSMutableString alloc] initWithString:@"UPDATE ^^=argv$$ SET "];
		[string appendFormat:@", %@ = '%@'" , @"_id" , ID];
^^for(var key in fields){var f = fields[key];$$
 ^^if(key == "_id") continue;$$
		if (updateItem.^^=key$$ != NULL) {
				[string appendFormat:@", %@ = '%@'" , @"^^=key$$" , updateItem.^^=key$$];
		}
^^}$$
        
		[muString appendString:[string substringFromIndex:2]];
		
		NSString * updateSql = [NSString stringWithFormat:@"%@ WHERE _id='%@';", muString, ID];
		@synchronized(self){
			BOOL res = [_database executeUpdate:updateSql];
			if (!res) {
				NSLog(@"error when creating db table");
			} else {
				NSLog(@"success to creating db table");
			}
		}
	}
}

//单例
+ (^^=provider$$ *)sharedDatabase
{
    static ^^=provider$$ * database;
    //线程保护
    @synchronized(self){
        if (database == nil) {
            database = [[^^=provider$$ alloc] init];
        }
    }
    
    return database;
}

@end
