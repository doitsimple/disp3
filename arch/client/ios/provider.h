^^
var idFieldName = "_id";
var model = $.ucfirst(argv)+"Model";
var provider = $.ucfirst(argv)+"Provider";
$$
//
//

#import <Foundation/Foundation.h>
#import "FMDatabase.h"
#import "FMResultSet.h"
#import "^^=model$$.h"


@interface ^^=provider$$ : NSObject

//创建单例对象
+ (^^=provider$$ *)sharedDatabase;

//添加对象
- (void)addItem:(^^=model$$ *)item;
//删除对象
- (void)deleteById:(NSString *) ID;
//查找所有对象 如果有userid,则基于userid查找
- (NSArray *)list;
//查找指定对象
- (^^=model$$ *)getById:(NSString *) ID;
//更新指定数据
- (void)upsertById:(NSString *) ID ^^=argv$$:(^^=model$$ *)updateItem;
@end
