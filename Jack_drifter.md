### 什么是 Redis ###

Redis 是一个基于 BSD 开源的使用 ANSI C 语言编写、支持网络、可基于内存亦可持久化的日志型、Key-Value 数据库，并提供多种语言的 API。

有三点需要强调：

- Redis 是一个 Key-Value 数据库。关系型数据库中存储的是一张张表，文档数据库中存储的是一个个文档，而 Key-Value 或 K/V 数据库中存储的是一个个键值对。
- Redis 是一个内存数据库。Redis 把所有的数据都存储在内存中，但 Redis 也可以把数据保存到磁盘中，即持久化。相对于磁盘，内存的数据读写速度要快的多，所以我们通常用 Redis 做缓存数据库。Redis 官网的性能测试显示，在 Linux 2.6, Xeon X3320 2.5Ghz 服务器上，50 个并发的情况下请求 10w 次，SET 操作可达 110000次/s，GET 操作可达 81000次/s。
- Redis 有五种数据类型。包括 string（字符串类型），hash（哈希类型），list（链表类型），set（无序集合类型）及 zset（有序集合类型）。

下面讲解下这五种数据类型：

- 字符串类型是 Redis 中最基本的数据类型，也是其他 4 种数据类型的基础，它能存储任何形式的字符串，包括二进制数据。
- 哈希类型是一个 string 类型的字段和字段值的映射表。哈希类型适合存储对象。相较于将对象的每个字段存成单个 string 类型，将一个对象存储在 hash 类型中会占用更少的内存，并且可以更方便的存取整个对象。
- 链表类型可以存储一个有序的字符串列表，内部是使用双向链表实现的。所以我们通常用链表类型的 LPUSH 和 LPOP 或者 RPUSH 和 RPOP 实现栈的功能，用 LPUSH 和 RPOP 或者 RPUSH 和 LPOP 实现队列的功能。
- 集合类型和数学中的集合概念相似，比如集合中的元素是唯一的、无序的，集合与集合之间可以进行交并差等操作。
- 有序集合类型与集合类型一样，只不过多了个 “有序” ，有序集合中每一个元素都关联了一个分数，虽然集合中每个元素都是不同的，但是它们的分数却可以相同。

**注意**：不同于 MongoDB，Redis 中的 hash、 list、 set 和 zset 都不支持数据类型的嵌套。比如集合类型的每个元素都只能是字符串，不能是另一个集合或者哈希等。


### 运行 Redis ###

POSIX 系统中编译后在 Redis 源代码目录的 src 文件夹中会有以下几个可执行文件（假如使用了 make install 命令的话，这些可执行文件也存在于 /usr/local/bin 目录），或者在 Windows 系统中解压的目录中可以找到几个可执行文件，分别为：

- redis-server ： Redis 服务器
- redis-cli ： Redis 命令行客户端
- redis-benchmark ： Redis 性能测试工具
- redis-check-aof ： AOF 文件修复工具
- redis-check-dump ： RDB 文件检查工具

**注意**：通过编译源代码安装的话也会产生一个 redis.conf 的配置文件。

我们最常使用的是 redis-server 和 redis-cli ，下面我们通过这两个可执行文件来学习如何使用 Redis。

最简单地，直接运行 redis-server 即可启动 Redis（Windows 下可直接运行 redis-server.exe）：

    $ redis-server

Redis 默认使用 6379 端口，我们也可以通过 --port 参数自己指定端口：

    $ redis-server --port 1234

运行 redis-cli 即可连接数据库（Windows 下可直接运行 redis-cli.exe）：

    $ redis-cli

redis-cli 也可指定服务器地址和端口：

    $ redis-cli -h 127.0.0.1 -p 1234

不出差错的话，此时已经连接上 Redis 数据库，我们通过 Redis 提供的 ping 命令来测试客户端与 Redis 是否连接正常：

    redis 127.0.0.1:6379> PING
    PONG

Redis 返回 PONG 证明连接正常。

### Redis 基本使用 ###

#### 字符串类型 ####

在字符串类型的操作中，`SET`、`GET` 和 `INCR` 是三个非常简单和常用的命令。使用方式如下：

-  `SET key value` ： 设置 key 的值为 value，成功时返回 OK。
-  `GET key` ： 获取 key 的值，成功时返回 key 的值。
-  `INCR key` ： key 的值加 1，成功时返回更新后 key 的值。

在 redis-cli 中输入如下命令：

    redis 127.0.0.1:6379> SET foo bar
    OK
    redis 127.0.0.1:6379> GET foo
    "bar"
    redis 127.0.0.1:6379> GET num
    (nil)
    redis 127.0.0.1:6379> INCR num
    (integer) 1
    redis 127.0.0.1:6379> GET num
    "1"
    redis 127.0.0.1:6379> INCR foo
    (error) ERR value is not an integer or out of range
    redis 127.0.0.1:6379> keys *
    1) "foo"
    2) "num"

可以看出，使用 `INCR key` 时，若 key 不存在则设 key 初值为 0 并自增 1 ，若 key 的值不为整数时会提示错误。`KEYS pattern` 会查找所有符合给定模式 pattern 的 key（不只是字符串类型，其余四种类型的键也会被返回），这里我们使用 `KEYS *` 返回了 Redis 中所有的键。

**注意**：在 Redis 中命令不区分大小写。也就是说 `SET foo bar` 和 `set foo bar` 是一样的，我们约定使用大写表示它是一个 Redis 命令。还需注意的一点是，数字值在 Redis 中以字符串的形式保存。

#### 哈希类型 ####

前面我们提过，哈希类型适合存储对象，我们使用以下几个命令进行测试：

- `HSET key field value` ： 设置 key 的 field 字段值为 value，成功时返回 1，如果 key 中 field 字段已经存在且旧值已被新值覆盖，则返回 0 。
- `HGET key field` ： 获取 key 的 field 字段的值，成功时返回 field 字段的值。
- `HGETALL key` ： 获取 key 中所有的字段和其值，若 key 不存在，返回空。

在 redis-cli 中输入如下命令：

    redis 127.0.0.1:6379> HSET author name nswbmw
    (integer) 1
    redis 127.0.0.1:6379> HSET author sex girl
    (integer) 1
    redis 127.0.0.1:6379> HSET author sex boy
    (integer) 0
    redis 127.0.0.1:6379> HGET author name
    "nswbmw"
    redis 127.0.0.1:6379> HGETALL author
    1) "name"
    2) "nswbmw"
    3) "sex"
    4) "boy"

#### 链表类型 ####

链表类型适合存储如社交网站的新鲜事，假如有一个存储了几千万个新鲜事的链表，获取头部或尾部的 10 条记录也是极快的。以下是链表类型常用的几个命令：

- `LPUSH key value [value ...]` ： 往 key 链表左边添加元素，返回链表的长度。
- `RPUSH key value [value ...]` ： 往 key 链表右边添加元素，返回链表的长度。
- `LPOP key ` ： 移除 key 链表左边第一个元素，并返回被移除元素的值。
- `RPOP key ` ： 移除 key 链表右边第一个元素，并返回被移除元素的值。
- `LRANGE key start stop` ： 获取链表中某一片段，但不会修改原链表的值。另外，与很多语言中截取数组片段的 slice 方法不同的是 LRANGE 返回的值包含最右边的元素。LRANGE 命令也支持负索引，即 -1 表示最后一个元素，所以 `LRANGE key 0 -1` 可以获取链表 key 中所有的元素。如果 start 的位置比 stop 的位置靠后，则返回空，如果 stop 大于实际链表范围，则会返回到链表最后的元素。

在 redis-cli 中输入如下命令：

    redis 127.0.0.1:6379> RPUSH list a 1 b
    (integer) 3
    redis 127.0.0.1:6379> LPUSH list 2 c 3
    (integer) 6
    redis 127.0.0.1:6379> RPOP list
    "b"
    redis 127.0.0.1:6379> LPOP list
    "3"
    redis 127.0.0.1:6379> LRANGE list 1 100
    1) "2"
    2) "a"
    3) "1"
    redis 127.0.0.1:6379> LRANGE list 0 -1
    1) "c"
    2) "2"
    3) "a"
    4) "1"

#### 集合类型 ####

集合类型非常适合存储如文章的标签，这样我们在获取标签的时候就可以避免获取重复的标签了。以下是集合类型常用的几个命令：

- `SADD key member [member ...]` ： 向集合中添加一个或多个元素，若要添加的元素集合中已经存在，则忽略这个元素。返回成功加入的元素数量（不包含忽略的）。
- `SREM key member [member ...]` ： 从集合中删除一个或多个元素，返回成功移除的元素的数量。
- `SMEMBERS key` ： 返回集合中所有元素。

在 redis-cli 中输入如下命令：

    redis 127.0.0.1:6379> SADD friends zhangsan lisi wangwu
    (integer) 3
    redis 127.0.0.1:6379> SREM friends lisi
    (integer) 1
    redis 127.0.0.1:6379> SMEMBERS friends
    1) "zhangsan"
    2) "wangwu"

集合类型还支持交集、差集和并集的运算，命令如下：

- `SINTER key [key ...]` ： 多个集合执行交集运算，并返回运算结果。
- `SDIFF key [key ...]` ： 多个集合执行差集运算，并返回运算结果。
- `SUNION key [key ...]` ： 多个集合执行并集运算，并返回运算结果。

在 redis-cli 中输入如下命令：

    redis 127.0.0.1:6379> SADD A 1 2 3
    (integer) 3
    redis 127.0.0.1:6379> SADD B 2 3 4
    (integer) 3
    redis 127.0.0.1:6379> SINTER A B
    1) "2"
    2) "3"
    redis 127.0.0.1:6379> SDIFF A B
    1) "1"
    redis 127.0.0.1:6379> SDIFF B A
    1) "4"
    redis 127.0.0.1:6379> SUNION A B
    1) "1"
    2) "2"
    3) "3"
    4) "4"

#### 有序集合类型 ####

有序集合类型中每一个元素都关联了一个分数。这使得我们不仅可以进行大部分集合类型的操作，还可以通过分数获取指定分数范围内的元素等与分数有关的操作。有序集合类型适用于比如通过文章访问量排序的功能。常用命令如下：

- `ZADD key score member [score member ...]` ： 向有序集合中加入一个或多个元素和该元素的值，如果该元素已存在则用新的分数替换原来的分数。返回新加入的元素个数（不包含已存在的元素）。
- `ZREM key member [member ...]` ： 删除集合中一个或多个元素，返回成功删除的元素的个数（不包含本来就不存在的元素）。
- `ZRANGE key start stop [WITHSCORES]` ： 按元素分数从小到大顺序返回从 start 到 stop 之间所有的元素（同样包含两端的元素）。如果需要同时获得对应元素的分数的话，在尾部加上 WITHSCORES 参数。如果两个元素分数相同，则按照元素的字典序排列。
- `ZREVRANGE key start stop [WITHSCORES]` ： 同上，只不过 ZREVRANGE 是按照元素分数从大到小顺序给出结果的。

在 redis-cli 中输入如下命令：

    redis 127.0.0.1:6379> ZADD ages 22 zhangsan 21 lisi  23 wangwu 1 baby
    (integer) 4
    redis 127.0.0.1:6379> ZREM ages baby
    (integer) 1
    redis 127.0.0.1:6379> ZRANGE ages 0 -1
    1) "lisi"
    2) "zhangsan"
    3) "wangwu"
    redis 127.0.0.1:6379> ZREVRANGE ages 0 -1
    1) "wangwu"
    2) "zhangsan"
    3) "lisi"
    redis 127.0.0.1:6379> ZRANGE ages 0 -1 WITHSCORES
    1) "lisi"
    2) "21"
    3) "zhangsan"
    4) "22"
    5) "wangwu"
    6) "23"

Redis 提供了一百多个命令，不知不觉中我们上面就已经介绍了二十几个命令了。Redis 命令都很容易记忆，符合语义并且大部分都遵循一个原则，如：哈希（hash）类型的命令前面会加个 `H` ，链表（list）类型的命令前面会加个 `L` ，集合（set）类型的命令前面会加个 `S` ，有序集合（zset）类型的命令会以 `Z` 开头等等。

更多关于 Redis 的命令请查阅官方文档或者中文翻译版（[www.redisdoc.com](www.redisdoc.com)），读者要是想继续深入学习 Redis 的话，建议阅读《Redis 入门指南》。


GET请求一个漂流瓶
GET /?user=xxx[&type=xxx]
//SUCCESS return
//{"code":1,msg{"time":"","owner":"","type":"","content":""}}
//ERROR return
//{"code":0,"msg":""}

GET 请求的参数
- `user`:发送漂流瓶的的用户名或id,具有唯一性
- `type`:漂流瓶类型，设置三种类型，:all代表全部,male代表男性，female代表女性。默认值为all

返回的 JSON 参数含义：

- `code` ： 标识码，1 代表成功，0 代表出错。
- `msg` ： 返回的信息，错误时返回错误的信息，成功时返回漂流瓶的信息：
    - `time` ： 漂流瓶扔出的时间戳。
    - `owner` ： 漂流瓶主人，可以是用户名或用户 id ，但必须唯一。
    - `type` ： 漂流瓶类型，为 male 或 female 之一。
    - `content` ： 漂流瓶内容。

以 POST 形式请求服务器扔出一个漂流瓶，返回 JSON 数据：

    POST owner=xxx&type=xxx&content=xxx[&time=xxx]
    // SUCCESS return {"code":1,"msg":"..."}
    // ERROR return {"code":0,"msg":"..."}

POST 请求的参数：

- `time` ： 漂流瓶扔出的时间戳，缺省时设置为 Date.now() 。
- `owner` ： 漂流瓶主人，可以是用户名或用户 id ，但必须唯一。
- `type` ： 漂流瓶类型，为 male 或 female 之一。
- `content` ： 漂流瓶内容。

使用HMSET 可以将多个键值对存入数据库中
`HMSET key field value [field value ...]`

- Redis 中的 EXPIRE 命令以秒为单位设置某个键的生存时间，PEXPIRE以毫秒为单位设置某个键的生存时间，这也是我们选择 Redis 搭建漂流瓶服务器的原因之一。这里使用 `client.EXPIRE(bottleId, 86400);` 设置每个漂流瓶的生存时间为 86400 秒即 1 天。过期后，该键值对会自动从数据库中移除，即该漂流瓶自动删除。

- Redis 中的 RANDOMKEY 命令用于从当前数据库中随机返回（不删除）一个 key 。当数据库不为空时，返回一个 key ，当数据库为空时，返回 nil （node_redis 中为 null）。

- TTL命令用于设置以秒为单位，设定key的剩余生存时间，若无设定时间，则返回-1;
    - 过期后会自动删除