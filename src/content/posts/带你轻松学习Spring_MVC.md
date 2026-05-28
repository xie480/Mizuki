---
title: "带你轻松学习Spring MVC"
author: "Yilena"
published: 2025-10-07
date: 2025-10-07
pubDate: 2025-10-07
description: 本文全面解析了Spring MVC框架的核心架构与工程实践。从MVC三层模型出发，深入剖析了DispatcherServlet的前端控制器机制及HandlerMapping、HandlerAdapter等核心组件。详细讲解了@RequestMapping路由策略、请求参数绑定、域对象管理、RestFul API设计规范及HttpMessageConverter序列化原理。此外，还探讨了全局异常处理、过滤器与拦截器的差异、CORS跨域配置及异步请求处理，最后对比了Spring MVC与WebFlux，为开发者构建高性能Web应用提供了系统指南。
tags: [Spring MVC, Web开发, 架构设计]
category: 技术笔记
pinned: true
licenseName: "CC BY 4.0"
sourceLink: "https://blog.csdn.net/2401_88959292/article/details/152519551?spm=1001.2014.3001.5501"
draft: false
image: "https://i-blog.csdnimg.cn/direct/1e3acedd642e40e5a71a9e9ae51960ed.png"
permalink: "encrypted-example"
---

**目录**
 


[一、概述](#t0)
 


[二、MVC架构与三层模型](#t1)
 


[（一）从浏览器到控制器的高层流程](#t2)
 


[（二）Model / View / Controller 各自职责](#t3)
 


[1. Contoller](#t4)
 


[2. Model](#t5)
 


[3. View](#t6)
 


[（三）三层模型在 MVC 中的配合](#t7)
 


[三、DispatcherServlet](#t8)
 


[（一）定位](#t9)
 


[（二）HandlerMapping & HandlerAdapter & ViewResolver & HandlerExceptionResolver](#t10)
 


[1. HandlerMapping](#t11)
 


[2. HandlerAdapter](#t12)
 


[3. ViewResolver](#t13)
 


[4. HandlerExceptionResolver](#t14)
 


[（三）配置](#t15)
 


[四、@RequestMapping](#t16)
 


[（一）基本用法与常用属性](#t17)
 


[1. 基本用法](#t18)
 


[2. 常用属性](#t19)
 


[（二）衍生注解](#t20)
 


[（三）路由策略](#t21)
 


[1. 路径匹配模式](#t22)
 


[2. 匹配优先级](#t23)
 


[3. 基于params或header的路由](#t24)
 


[五、请求参数绑定](#t25)
 


[（一）简单数据类型绑定](#t26)
 


[（二）@RequestParam & @PathVariable & @RequestHeader & @CookieValue](#t27)
 


[1. @RequestParam](#t28)
 


[2. @PathVariable](#t29)
 


[3. @RequestHeader](#t30)
 


[4. @CookieValue](#t31)
 


[六、域对象](#t32)
 


[（一）Request域](#t33)
 


[（二）Session域](#t34)
 


[（三）Application域](#t35)
 


[七、转发与重定向](#t36)
 


[八、RestFul](#t37)
 


[（一）URL设计](#t38)
 


[（二）HTTP状态码与响应体设计](#t39)
 


[九、HttpMessageConverter](#t40)
 


[十、@RequestBody & @ResponseBody](#t41)
 


[（一）@RequestBody](#t42)
 


[（二）@ResponseBody](#t43)
 


[十一、RequestEntity & ResponseEntity](#t44)
 


[（一）RequestEntity](#t45)
 


[（二）ResponseEntity](#t46)
 


[十二、异常处理](#t47)
 


[（一）@ExceptionHandler & @ControllerAdvice](#t48)
 


[（二）全局异常处理](#t49)
 


[十三、过滤器与拦截器](#t50)
 


[（一）Servlet Filter](#t51)
 


[（二）Handler Interceptor](#t52)
 


[十四、CORS](#t53)
 


[（一）MVC层](#t54)
 


[（二）Filter层](#t55)
 


[十五、异步请求](#t56)
 


[（一）Servlet 3.0 异步支持](#t57)
 


[（二）线程上下文](#t58)
 


[十六、分析MVC层一次请求全流程](#t59)
 


[（一）匹配映射](#t60)
 


[（二）获取适配器](#t61)
 


[（三）触发拦截器preHandle](#t62)
 


[（四）执行方法](#t63)
 


[（五）触发拦截器postHandle](#t64)
 


[（六）渲染视图](#t65)
 


[（七）触发拦截器afterCompletion](#t66)
 


[（八）异常处理](#t67)
 


[十七、对比Spring MVC 与 Spring WebFlux](#t68)
 


---
 



 


## 一、概述
 


![](https://i-blog.csdnimg.cn/direct/1e3acedd642e40e5a71a9e9ae51960ed.png)
 


 MVC 是基于模型-视图-控制器（MVC）模式的Web框架。
 


它负责把分发到控制器，处理请求参数、绑定校验、执行业务并返回视图或JSON等响应格式。
 


---
 


## 二、架构与三层模型
 


### （一）从浏览器到控制器的高层流程
 


简单来说流程如下，具体请见分析源码章节：
 


1. 浏览器发起请求，包含传参、请求体、Cookie或Header。
2. Web容器（常见的如Tomcat）接受HTTP请求，并转交给Spring容器中的DispatcherServlet。
3. DispatcherServlet调用HandlerMapping匹配该路径的Conroller控制器。
4. HandlerAdapter将HTTP的请求数据绑定到控制器的方法参数上，并执行方法。
5. 执行完后控制器返回渲染模板或JSON对象，DispatcherServlet将结果写回HTTP响应并返回给浏览器
 


### （二）Model / View / Controller 各自职责
 


#### 1. Contoller
 


负责接受并解析请求，控制流程并返回响应结果。
 


所以Controller只应该关心请求和响应，而不关心业务。
 


#### 2. Model
 


负责承载数据和状态，供渲染或映射。
 


一般分为三类：
 


- **Domain / Entity：**DB表的映射实体
- **DTO：**层间传输实体，一般是Controller传给Service。
- **VO：**渲染实体，提供JSON响应并在前端渲染。
 


#### 3. View
 


负责渲染Model。
 


只关心渲染，而不在意业务和数据处理。
 


### （三）三层模型在 MVC 中的配合
 


- **表现层**：处理 HTTP、页面渲染，通常对应MVC的 Controller + View。
- **业务层**：封装业务逻辑与事务。
- **持久层**：直接与数据库交互。
 


MVC关心的是请求分派以及数据渲染的问题，而三层模型关注职责分离和可维护性。
 


---
 


## 三、DispatcherServlet
 


### （一）定位
 


DispatcherServlet是Spring MVC的前端控制器，遵循Front Controller模式。所有匹配到该 的请求，由它负责把请求分派给合适的handler，处理返回结果并最终渲染视图或写入响应体。
 


父类FrameworkServlet负责WebApplicationContext的启动管理以及Servlet生命周期的基础逻辑，使得DispatcherServlet只需专注HTTP请求的处理与分发。
 


### （二）HandlerMapping & HandlerAdapter & ViewResolver & HandlerExceptionResolver
 


#### 1. HandlerMapping
 


根据HTTP请求查找到匹配的HandlerMethod（包含URL、HTTP方法等等的方法元数据封装的对象），并返回HandlerExecutionChain，可以视为HandlerMethod+ Interceptors。
 


最常见的实现是RequestMappingHandlerMapping，HandlerMapping会在初始化时扫描带有@Controller注解的类中的所有方法并提前构建好HandlerMethod的Bean再放入Spring容器中。
 


另一种实现是SimpleUrlHandlerMapping，一般是基于XML配置的URL进行匹配并创建Bean。
 


#### 2. HandlerAdapter
 


由于HandlerMethod由于元数据的不同也会衍生出不同类型，而HandlerAdapter就是一个将任意HandlerMethod都得以使用统一接口执行的适配器的实现，并返回ModelAndView或者JSON响应对象。
 


#### 3. ViewResolver
 


负责将逻辑视图名称转化成View对象，一般会根据第三方组件的配置来进行匹配。
 


也就是说HandlerMethod如果要返回视图的话，其实只会返回一个String的视图名称，而ViewResolver则是根据配置文件的前缀URL + 视图名称匹配对应的视图，再封装成View对象。
 


不过需要注意的一点是，如果在REST场景，也就是Controller使用@Controller + @ResponseBody 或 @RestController的情况下，会直接绕过ViewResolver，直接将响应结果转化成JSON或普通字符串返回。
 


#### 4. HandlerExceptionResolver
 


当HandlerMethod在执行过程中抛出了异常时，HandlerExceptionResolver会将异常解析成视图或者JSON字符串直接响应给前端，避免再抛回Servlet容器。
 


Spring提供了DefaultHandlerExceptionResolver的默认实现类，会将异常映射为HTTP错误码。
 


不过一般推荐自定义一个全局异常处理实现类，使用@ControllerAdvice / @RestControllerAdvice和@ExceptionHandler注解来进行封装。
 


### （三）配置
 


传统模式下需要配置web.xml文件：
 


```xml
<servlet>
  <servlet-name>app</servlet-name>
  <servlet-class>org.springframework.web.servlet.DispatcherServlet</servlet-class>
  <init-param>
    <param-name>contextConfigLocation</param-name>
    <param-value>/WEB-INF/app-servlet.xml</param-value>
  </init-param>
  <load-on-startup>1</load-on-startup>
</servlet>
<servlet-mapping>
  <servlet-name>app</servlet-name>
  <url-pattern>/</url-pattern>
</servlet-mapping>
```
 


不过在Spring Boot场景下，会自动配置DispatcherServlet，只需添加spring-boot-starter-web即可，方便又快捷，是当下最为流行的配置方式。
 


---
 


## 四、@RequestMapping
 


### （一）基本用法与常用属性
 


#### 1. 基本用法
 


@RequestMapping可用于类或方法上，类级别的路径会与方法级别的路径拼接在一起。
 


```java
@RestController
@RequestMapping("/user")             
public class UserController {
 
    @RequestMapping("/{id}")
    public UserDto getUserInfo(@PathVariable Long id) {
    }
 
    @RequestMapping("/search")
    public List<UserDto> list() {
    }
}
```
 


#### 2. 常用属性
 


**(1) value / path**
 


表示匹配的URL路径，支持一对多的映射模式：
 


```java
@RequestMapping(path = {"/a", "/b"})
```
 


**(2) method**
 


表示使用的HTTP方法：
 


```java
@RequestMapping(method = RequestMethod.POST)
```
 


不过一般会使用衍生注解来代替该属性。
 


**(3) params**
 


表示请求参数的匹配条件，用于进一步细化路由规则：
 


```java
@RequestMapping(path="/search", params = {"q", "type=user"})
```
 


- **"q":**请求参数中必须包含命名为q的参数
- **"!q":**请求参数中必须不包含命名为q的参数
- **"q=1":**请求参数中命名为q的参数的值必须为1
- **"q!=1":**请求参数中命名为q的参数的值必须不为1
 


**(4) headers**
 


与params类似，只不过headers属性是适用于请求头的：
 


```java
@RequestMapping(headers = "X-API-VERSION=1")
```
 


匹配规则与params一致，这里不再做赘述。
 


**(5) consumes / produces**
 


表示请求与响应的Content-Type：
 


```java
@RequestMapping(consumes = "application/json")
@RequestMapping(produces = "application/json")
```
 


### （二）衍生注解
 


Spring提供了多个基于@RequestMapping的组合注解，更便捷也语义明确：
 


- `@GetMapping`
- `@PostMapping`
- `@PutMapping`
- `@DeleteMapping`
- `@PatchMapping`
 


这些注解只是语法糖，但在实际代码中更常用，因为更简洁、语义清晰。
 


### （三）路由
 


#### 1. 路径匹配模式
 


- **Ant风格：**
  - ? 单字符
  - * 任意字符（不跨 /）
  - ** 多级路径（可跨 /）
- **Path Variables**：/items/{id}
- **正则表达式**：/users/{id:\\d+}
 


#### 2. 匹配优先级
 


当同一个请求同时匹配了多个路由映射时，Spring会选择路由规则最为具体的一个。
 


具体规则如下：
 


1. **精确匹配优先**（ /users/1  &gt; /users/{id}）
2. **较少通配字符优先**（/users/{id} &gt; /users/* &gt; /users/**）
3. **长路径优先**
4. **HTTP 方法匹配：**如果路径都相同，但方法不同（GET/POST），按方法匹配选择；若请求方法与mapping不匹配会报405。
5. **params / headers / consumes / produces 更具体的 mapping 优先**
 


如果匹配到最后出现多个优先级相同的路由映射，Spring则会抛出异常，需要我们手动处理。
 


#### 3. 基于params或的路由
 


其实也就是使用params和header属性罢了，在此是为了讲解这两种属性的实际使用场景：
 


```java
@RequestMapping(path="/", headers = "X-API-VERSION=2")
```
 


实际上可以通过这种路由，在不变动原代码和路由映射的情况下，实现A/B流量灰度控制这类策略。
 


---
 


## 五、请求参数绑定
 


### （一）简单数据类型绑定
 


Java原始类型、包装类型、String、Enum、Date、UUID 等被认为是简单类型，当控制器方法是简单类型且没有任何注解的时候，Spring会默认将其当作请求参数，等同于加上了@RequestParam注解。
 


### （二）@RequestParam & @PathVariable & @RequestHeader & @CookieValue
 


这四个注解的重要参数如下：
 


- **value / name：**参数名
- **required：**默认true。若为false且参数缺失时会抛出异常
- **defaultValue：**提供默认值并把required属性视为false
 


#### 1. @RequestParam
 


该注解是从URL查询参数或者POST表单数据中取值的。
 


 


```java
@GetMapping("/search")
public List<User> search(@RequestParam String q,
                         @RequestParam(defaultValue = "10") int size,
                         @RequestParam(required = false) String tag) {
}
```
 


#### 2. @PathVariable
 


该注解时从URL路径模板中取值的。
 


支持正则表达式匹配。
 


```java
@GetMapping("/users/{id}")
public User detail(@PathVariable("id") Long id) {
}
```
 


#### 3. @RequestHeader
 


该注解是从请求头中取值的。
 


```java
@GetMapping("/v")
public String v(@RequestHeader(name="X-Api-Version", required=false, defaultValue="1") String ver) {
}
```
 


#### 4. @CookieValue
 


该注解是从Cookie中取值的。
 


```java
@GetMapping("/cookie")
public void cookie(@CookieValue(name="theme", required=false) Cookie themeCookie) {
}
```
 


---
 


## 六、域对象
 


### （一）域
 


以一次请求为单位的作用域。
 


生命周期为从请求到Servlet容器开始处理直到响应完成并返回给客户端的全流程。
 


存活时间短，典型用途是把controller层产生的数据传给视图渲染使用。
 


需要注意的是，通常情况下我们每个请求是只由一个线程处理的，但是如果在异步调用的情况下会跨线程传递，在此情况需要使用容器提供的AsyncContext将请求包装传递给异步线程。
 


Request域是天然线程安全。
 


### （二）域
 


以一次会话为单位的作用域，可跨多个Request。
 


生命周期由业务逻辑决定。
 


典型用途是用户登录权限校验以及socket连接建立。
 


注意不要把大量数据放入Session，会占用堆空间并提高GC频率。
 


Session域存在并发问题，需要自行处理逻辑。
 


### （三）Application域
 


以整个Web应用为单位的作用域，可跨多个Session。
 


生命周期与整个Web应用相关联。
 


典型用途是拦截器与监听器。
 


与Session域一样，最好不要存放大量数据。
 


Application域存在并发问题，需要自行处理逻辑。
 


---
 


## 七、转发与
 


| 特性 | 转发（forward） | 重定向（redirect） |
| --- | --- | --- |
| 浏览器地址栏 | 不变 | 变成重定向目标 URL |
| HTTP 请求数 | 1 次 | 2 次 |
| 请求/响应对象 | 使用同一个 HttpServletRequest / HttpServletResponse | 新的 HttpServletRequest / HttpServletResponse |
| 能否跨域 | 不可以 | 可以 |
| 性能 | 少一次网络往返 | 多一次网络往返 |

 


简单来说，转发就是在服务器内部将原本处理该请求的资源进行更换；而重定向是原本的请求返回给客户端了特定的HTTP状态码，客户端接收到后会立刻再次发起一次请求去访问或修改新的资源，所以转发的性能更高，但重定向支持跨域，因为第二次的网络往返脱离了原本的服务器域。
 


转发一般用于抛出异常后的错误视图渲染或控制器的链式处理。
 


而重定向一般用于登录令牌的刷新以及短链接的跳转。
 


---
 


## 八、RestFul
 


### （一）URL设计
 


我们应该使用HTTP方法来表达语义，而不要在URL中使用动词或方法名，也就是说我们提倡使用例如 /user而不是/getUser。
 


对于集合资源，我们使用/users表示用户集合，用/users/{id}表示单个用户。
 


对于资源关系，我们应该用层次化来映射，但是需要避免过深嵌套，提倡使用/users/{id}/orders，而不推荐/a/{id}/b/{id}/c/{id}/d/{id}。
 


对于资源的身份，或者说是访问条件，我们应该使用路径来表示，例如分页：GET /products?category=phone&sort=price_desc&page=2&size=20。
 


对于版本化处理，我们只推荐两种方式：一是在URL中添加版本号，例如：/v1/users；另一种则是在header中添加属性，第一种简单直观，第二种灵活性和可扩展性更好。
 


### （二）HTTP状态码与响应体设计
 


对于HTTP 状态码工程化建议如下：
 


- 2xx
  - 200 OK：业务逻辑处理成功、返回实体
  - 201 Created：资源已创建，必须返回Location header指向新资源
  - 202 Accepted：异步处理已接受，返回位置或状态查询地址
  - 204 No Content：资源已删除，无返回体
- 3xx
  - 301/308：永久重定向
  - 302/303/307：临时重定向（注意 POST→GET 语义用 303）
- 4xx
  - 400 Bad Request：参数/请求语法错误、JSON 解析失败、验证失败
  - 401 Unauthorized：未认证或认证失败
  - 403 Forbidden：已认证但无权限
  - 404 Not Found：资源不存在
  - 405 Method Not Allowed：方法不允许，一般是HTTP方法错误或是传参错误
  - 409 Conflict：冲突（例如版本冲突或重复资源）
  - 429 Too Many Requests：超出最大并发限制
- 5xx
  - 500 Internal Server Error：服务器异常
  - 503 Service Unavailable：服务暂不可用、降级或维护
 


>  
>  其中针对202 Accepted状态码，我们提倡建立SSE或者WS长连接进行轮询其状态，直至返回错误或成功状态。 
> 
 


对于HTTP的不同方法，我们也规范了其响应：
 


- 针对GET，应该返回200 OK状态码并在响应体中带上JSON格式的访问资源。
- 针对POST，应该返回201 Created状态码，并返回新资源的访问URL
- 针对PUT，应该返回200 OK状态码并返回更新的JSON格式的资源。
- 针对PATCH，响应同PUT。
- 针对DELETE，应该返回204状态码并无返回体。
 


针对错误响应，我们也应该规范响应体格式：
 


```java
{
  "type": "http://example.com/404",
  "title": "资源不存在",
  "status": 404,
  "detail": "访问参数[id]格式错误",
  "instance": "/users/attack"
}
```
 


- type是错误页面的跳转URL，是可选的
- title是错误响应的短标题
- status则是HTTP状态码
- detail是对本次错误的描述
- instance是本次错误请求的URL
 


---
 


## 九、HttpMessageConverter
 


HttpMessageConverter是用来把HTTP请求体反序列化为 Java 对象以及 把 Java 对象序列化为 HTTP响应体的转化器。
 


在请求进入Controller、由RequestMappingHandlerAdapter调用HandlerMethod之前，框架会用一组已注册的HttpMessageConverter尝试把请求体转换成目标方法参数类型；同理响应会用它们把返回值写出。
 


当DispatcherServlet匹配到了HandlerMethod后，RequestMappingHandlerAdapter会调用HandlerMethodArgumentResolver，检测当前HandlerMethod是否存在@RequestBody或者需要转化器反序列化，若需要按注册顺序遍历HttpMessageConverter列表，调用canRead方法进行匹配，匹配成功后反序列化请求体。方法执行完成后返回响应体也是同理。不过若是两个流程中找寻不到合适的HttpMessageConverter就会抛出异常。
 


---
 


## 十、@RequestBody & @ResponseBody
 


### （一）@RequestBody
 


@RequestBody正如上文所说，其实起到的是一个标记作用，代表该请求的请求体需要被反序列化成Java对象并注入到接口参数中。
 


除此之外该注解也存在required属性，当为false时允许请求体为null。
 


### （二）@ResponseBody
 


该注解其实也是起到一个标注作用，代表其返回的响应体需要被序列化为HTTP响应体，一般是JSON格式字符串。
 


现在主流的REST场景下提倡后端使用@ResponseBody注解返回JSON格式字符串给前端进行数据渲染，但是每个方法上都要加该注解就显得重复冗余，所以Spring提供了@RestController注解，其等同于@Controller + 类内部每个方法上的@ResponseBody。
 


---
 


## 十一、RequestEntity & ResponseEntity
 


### （一）RequestEntity
 


可以获取请求的HTTP状态码、headers、Cookie等等。
 


### （二）ResponseEntity
 


可以自定义响应的HTTP状态码、headers、Cookie等等。
 


如果需要显式控制 HTTP 状态或 headers时才推荐使用ResponseEntity封装返回响应，其余状况推荐直接返回实体。
 


---
 


## 十二、异常处理
 


### （一）@ExceptionHandler & @ControllerAdvice
 


@ControllerAdvice是一个跨Controller的增强处理器，用于把错误处理从单个 Controller 提取到集中位置。
 


@ExceptionHandler用于在标注了@ControllerAdvice的类内声明方法来处理特定类型的异常（可以处理一个或多个异常类型）。
 


```java
@ControllerAdvice(annotations = RestController.class) 
public class GlobalExceptionHandler {
 
    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<?> handleNotFound(NotFoundException ex, HttpServletRequest req) {
        var body = Map.of(
           // 省略
        );
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(body);
    }
 
    // 最后兜底
    @ExceptionHandler(Exception.class) 
    public ResponseEntity<?> handleAny(Exception ex, HttpServletRequest req) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
```
 


### （二）全局异常处理
 


首先需要讲解一下Spring的异常处理链，当DispatcherServlet捕获到HandlerMethod抛出的异常时，会遍历异常处理链，直到其中一个处理器处理成功后停止：
 


1. **ExceptionHandlerExceptionResolver：**负责处理@ExceptionHandler 与 @ControllerAdvice，也就是我们自定义的异常处理器
2. **ResponseStatusExceptionResolver：**负责处理ResponseStatusException以及被@ResponseStatus注解的异常类。
3. **DefaultHandlerExceptionResolver：**负责处理Spring的内置异常。
 


>  
>  @ResponseStatus注解一般用于自定义异常类： 
>  @ResponseStatus(HttpStatus.NOT_FOUND)public class NotFoundException extends RuntimeException {}一键获取完整项目代码java运行 
> 
 


可以注册HandlerExceptionResolver来自定义调整异常处理链的顺序。
 


下面提供一个推荐使用的全局异常处理器模板：
 


```java
@ControllerAdvice
public class ApiExceptionHandler extends ResponseEntityExceptionHandler {
 
    @ExceptionHandler(Exception.class)
    protected ResponseEntity<Object> handleBusiness(BusinessException ex, WebRequest request) {
        var body = Map.of("status", 409, "title", ex.getMessage());
        return handleExceptionInternal(ex, body, new HttpHeaders(), HttpStatus.CONFLICT, request);
    }
 
    // 重写validation处理，返回统一错误格式
    @Override
    protected ResponseEntity<Object> handleMethodArgumentNotValid(
         MethodArgumentNotValidException ex, HttpHeaders headers, HttpStatus status, WebRequest request) {
        var errors = ex.getBindingResult().getFieldErrors().stream()
            .map(f -> Map.of("field", f.getField(), "msg", f.getDefaultMessage()))
            .toList();
        var body = Map.of("status", 400, "title", "Validation Failed", "errors", errors);
        return handleExceptionInternal(ex, body, headers, HttpStatus.BAD_REQUEST, request);
    }
}
```
 


---
 


## 十三、过滤器与拦截器
 


![](https://i-blog.csdnimg.cn/direct/56dba3332c254b97b67871447af47fb3.png)
 


### （一）Servlet Filter
 


Filter是Servlet 规范层面的组件，属于Servlet容器提供的机制，在请求进入DispatcherServlet前被调用，用于实现请求的预处理与响应的后处理。
 


但是由于顺序最优先，所以其无法直接访问Spring的组件，因为隔了一层拦截器，而且也无法对业务方法参数、注解等进行细粒度拦截。
 


```java
@Configuration
public class FilterConfig {
 
    @Bean
    public FilterRegistrationBean<LogFilter> logFilter() {
        FilterRegistrationBean<LogFilter> bean = new FilterRegistrationBean<>();
        bean.setFilter(new LogFilter());
        bean.addUrlPatterns("/*");
        bean.setOrder(1);
        return bean;
    }
}
 
@Component
@Order(1) 
public class LogFilter implements Filter {
 
    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        HttpServletRequest req = (HttpServletRequest) request;
        // 放行
        chain.doFilter(request, response);
    }
}
```
 


一般用于安全校验、日志记录等等。
 


>  
>  如今推荐在Filter内部进行用户权限校验 
>  自JDK25后虚拟线程相关的新特性得以稳定发布，以后会使用ScopedValue + 虚拟线程来替代如今的ThreadLocal + 平台线程。 
>  关于ScopedValue如果不是很了解的同学可以阅读下面这两篇博客： 
>  带你轻松学习虚拟线程和StructuredTaskScope-CSDN博客 
>  跟进 JDK25：将虚拟线程安全引入生产的权衡与实战_jdk25 线程池-CSDN博客 
>  ScopedValue是以作用域的形式绑定值的，也就是说值的可见性取决于我们在哪个线程、哪个代码块中调用了run方法。 
>  而Filter的设计正好完整包裹住了一次请求经过的全部代码块，如果在Filter中进行用户权限校验的话，run方法也正好包住了这个请求，确保拦截器、控制器、视图等都处在同一个作用域内，这是最简单，同时也是最有效的。 
>   
>  为什么不推荐在Interceptor内部调用run方法？ 
>  因为Filter的回调设计是包住了整个请求链，与作用域的定义很切合，而Interceptor的回调则是分开的另一个方法，也就是说在请求的时候调用的是preHandle方法，响应的时候调用的又是afterCompletion方法，作用域是完全分开的，如果在拦截器中调用run方法，那么在调用完preHandle方法后ScopedValue的作用域就结束了。 
>  因此，如果要使用ScopedValue + 虚拟线程的方案，请将用户权限校验从拦截器迁移至过滤器，具体实现可见我上面发的博客。 
> 
 


### （二）Handler Interceptor
 


Interceptor 是Spring MVC层面的拦截机制，它拦截的是 Controller 方法调用前后的流程。属于Spring框架控制，不依赖Servlet容器。
 


因此，其可以访问HandlerMethod、ModelAndView等等。
 


```java
@Configuration
public class WebConfig implements WebMvcConfigurer {
 
    @Autowired
    private AuthInterceptor authInterceptor;
 
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(authInterceptor)
                .addPathPatterns("/api/**")      
                .excludePathPatterns("/api/login");
    }
}
 
@Component
public class AuthInterceptor implements HandlerInterceptor {
 
    // 控制器方法调用前执行
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)
            throws Exception {
        String token = request.getHeader("Authorization");
        if (token == null || !token.equals("valid-token")) {
            response.setStatus(HttpStatus.UNAUTHORIZED.value());
            response.getWriter().write("Unauthorized");
            return false; 
        }
        return true;
    }
 
    // 控制器方法执行后
    @Override
    public void postHandle(HttpServletRequest request, HttpServletResponse response,
                           Object handler, ModelAndView modelAndView) {
        System.out.println("postHandle 执行");
    }
 
    // 整个请求结束后
    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response,
                                Object handler, Exception ex) {
        System.out.println("afterCompletion 执行");
    }
}
 
```
 


一般用于权限校验、日志记录或者AOP替代等等。
 


---
 


## 十四、CORS
 


浏览器的同源策略阻止网页脚本随意访问不同源的资源。CORS是浏览器与服务器之间的一套协商协议：服务器决定是否允许来自某个Origin的跨域请求，浏览器会根据服务器响应决定是否允许页面读取响应或继续发起实际请求。
 


也就是说，当浏览器要发起一个跨域请求时，会先发送一个预检请求，服务端接收后如果响应回一个允许的CORS头时，服务器才会正式发起该请求。
 


Spring提供了两种支持CORS的策略：
 


### （一）MVC层
 


使用@CrossOrigin注解，当请求到达HandlerMapping阶段的时候会检测是否符合预检请求，若符合，则会直接使用CorsProcessor进行处理，并返回CORS头响应。
 


@CrossOrigin注解可放在类或方法上，方法的优先级大于类，若匹配才会返回允许响应体。
 


```java
@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "https://app.example.com", maxAge = 3600)
public class ApiController {
 
    @PostMapping("/submit")
    @CrossOrigin(origins = {"https://a.example.com","https://b.example.com"}, 
                 allowedHeaders = {"Content-Type","X-My-Header"}, 
                 allowCredentials = "true")
    public String submit(@RequestBody MyDto dto) {
    }
}
```
 


当然，MVC也支持全局预检请求校验：
 


```java
@Configuration
public class WebConfig implements WebMvcConfigurer {
 
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("https://app.example.com")
                .allowedMethods("GET","POST","PUT","DELETE","OPTIONS")
                .allowedHeaders("Content-Type","Authorization")
                .exposedHeaders("X-Total-Count")
                .allowCredentials(true)
                .maxAge(3600);
    }
}
```
 


既然是MVC层，那么触发时机肯定没有Filter层的早，而且无法处理DispatcherServlet以外的请求。
 


### （二）Filter层
 


```java
@Bean
public FilterRegistrationBean<CorsFilter> corsFilterRegistration() {
    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    CorsConfiguration config = new CorsConfiguration();
    config.setAllowedOrigins(List.of("https://app.example.com"));
    config.setAllowedMethods(List.of("GET","POST","PUT","DELETE","OPTIONS"));
    config.setAllowedHeaders(List.of("*"));
    config.setAllowCredentials(true);
    config.setMaxAge(3600L);
    source.registerCorsConfiguration("/**", config);
 
    CorsFilter corsFilter = new CorsFilter(source);
    FilterRegistrationBean<CorsFilter> bean = new FilterRegistrationBean<>(corsFilter);
    bean.setOrder(Ordered.HIGHEST_PRECEDENCE); 
    return bean;
}
```
 


原理都是一致的，只是可处理请求范围和调用时机不一致。
 


MVC层更为灵活，可扩展性更高；而Filter层的调用时机最早，实际请根据业务逻辑进行权衡。
 


---
 


## 十五、异步请求
 


### （一）Servlet 3.0 异步支持
 


容器线程可以调用request.startAsync()，获得AsyncContext，然后返回，容器线程释放。你可以在其他线程用AsyncContext.complete() 完成请求或dispatch()将请求重新派发回容器处理。
 


```java
public void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
    AsyncContext ac = req.startAsync();
    ac.setTimeout(60000);
    ac.start(() -> {
        try {
            Thread.sleep(2000);
            resp.getWriter().write("done");
        } catch(Exception e) {
            e.printStackTrace();
        } finally {
            // 结束响应
            ac.complete(); 
        }
    });
}
```
 


可以使用AsyncListener进行生命周期回调的监听：
 


- onComplete(AsyncEvent)：正常完成时调用。
- onTimeout(AsyncEvent)：超时时调用。
- onError(AsyncEvent)：异常时调用。
- onStartAsync(AsyncEvent)：当 startAsync 再次调用时触发（嵌套 async）。
 


### （二）线程上下文
 


当一个请求从容器线程切换到后台线程进行异步处理的时候，当前线程关联的上下文一般不会自动跨线程传播，一般需要自己实现一些逻辑。
 


但如果使用的是JDK25的虚拟线程，我们完全可以使用结构化并发 + ScopedValue来替代传统的异步编程模式，直接在结构化并发的域中传递当前父线程的ScopedValue，然后开启一个子线程任务等待结束回调即可。
 


```java
ScopedValue<String> USER = ScopedValue.newInstance();
 
ScopedValue.where(USER, userId).run(() -> {
    try (var scope = new StructuredTaskScope.ShutdownOnFailure()) {
        var fut = scope.fork(() -> test(USER.get()));
        scope.join();
        scope.throwIfFailed();
    }
});
```
 


---
 


## 十六、分析MVC层一次请求全流程
 


### （一）匹配映射
 


调用DispatcherServlet.getHandler(request)，遍历已经注册的HandlerMapping，按order顺序查找第一个匹配的HandlerExecutionChain并返回。
 


注意这就是之前CORS校验是否是预检请求的阶段。
 


### （二）获取适配器
 


拿着Handler后，调用DispatcherServlet.getHandlerAdapter(handler)，遍历handlerAdapters，查找第一个匹配的适配器并返回，关于适配器的作用在上文也已经提到过了。
 


### （三）触发拦截器preHandle
 


调用HandlerExecutionChain.applyPreHandle(request,response)，会正序按order顺序遍历每一个拦截器，并调用其中的preHandle方法，任意拦截器返回false就会跳过第四步，直接执行第五步。
 


### （四）执行方法
 


调用RequestMappingHandlerAdapter.handle(HttpServletRequest, HttpServletResponse, Object handler)，执行方法。
 


内部具体流程为：
 


先调用InvocableHandlerMethod.invokeAndHandle()遍历解析器链匹配合适的解析器进行方法参数解析，其中@RequestBody的解析器还会根据请求头的Content-Type将请求体反序列化。
 


接着调用目标方法并获取返回值或者异常。
 


然后遍历处理器链，匹配合适的处理器来决定是构造ModelAndView还是直接写响应体，其中@Response的处理器会根据响应头的Content-Type将请求体序列化。
 


### （五）触发拦截器postHandle
 


调用mappedHandler.applyPostHandle(request, response, mv)，会逆序遍历第三步返回true的拦截器，并调用其中的postHandle方法，一般用于在视图渲染前对执行方法返回体进行修改。
 


注意这里只会调用第三步返回true的拦截器的方法！
 


### （六）渲染视图
 


若ModelAndView为null且当前响应已经写入了响应体了，则直接跳过该步。
 


反之则调用resolveViewName(modelAndView.getViewName(), locale)遍历ViewResolver直至找到第一个可以渲染的View实例。
 


调用view.render(model, request, response)进行视图的渲染。
 


### （七）触发拦截器afterCompletion
 


调用mappedHandler.triggerAfterCompletion(request, response, null)，逆序遍历第三步返回true的拦截器，并调用其中的afterCompletion方法。
 


### （八）异常处理
 


若以上任意步骤抛出了异常，则会被catch块捕获，立即执行processHandlerException(request, response, mappedHandler, ex)，遍历异常解析器，直至匹配后进行处理，具体处理流程上文也已经提到过。
 


---
 


## 十七、对比Spring MVC 与 Spring WebFlux
 


Spring WebFlux使用响应式驱动，在 I/O 密集、高并发长连接（SSE、WS）场景下更具优势。
 


传统MVC阻塞时编程在上面这些场景确实会逊色不少，下面简单对比一下两种编程模式：
 


| 维度 | Spring MVC | Spring WebFlux |
| --- | --- | --- |
| 核心模型 | 阻塞Servlet API | 非阻塞 / 响应式 |
| 主要依赖 | spring-webmvc + Tomcat | spring-webflux + Netty |
| 编程模型 | 注解式 Controller 返回 POJO | 注解式 Controller 返回 Mono/Flux 或 函数式 Handler |
| 协议处理 | HttpServletRequest/Response | ServerRequest/ServerResponse 或 ServerWebExchange |
| IO 模式 | 阻塞 IO | 非阻塞 IO |
| 并发模型 | 线程池 | 事件循环 + worker pool |
| 后端 DB | JDBC | R2DBC / Reactive Mongo / Reactive Redis |
| 典型适用 | 传统企业应用、SSR | 高并发微服务、流式/实时、SSE/WS |

 


从整体来看，Spring WebFlux在企业级Web应用中确实展现出强大的优势。
 


它基于响应式编程模型，具备天然的异步与背压特性，非常适合高并发与流式数据场景。然而，WebFlux 的编程范式与传统 MVC 存在显著差异——涉及 Reactor 模型、函数式流操作、异步链式调用等概念，这使得开发者需要掌握新的响应式思维模式，也在一定程度上增加了学习与维护成本。
 


相较之下，随着虚拟线程与结构化并发的成熟，传统的 Spring MVC 架构迎来了新的生命力。
 


在这种模型下，请求的阻塞仅发生在虚拟线程层面，不再占用宝贵的底层平台线程资源，从而大幅提升了并发处理能力。无论是 I/O 密集型场景，还是长连接（如 SSE、WebSocket）应用，虚拟线程都能在保持同步编程风格的同时实现接近WebFlux的高并发性能。
 


综合学习成本、生态成熟度与未来趋势来看，基于虚拟线程 + 结构化并发的MVC模式更有望成为下一代 Java Web 应用的主流选择。它既保留了传统 MVC 简洁、直观的编程体验与完善的生态体系，又在底层实现上获得了接近响应式的非阻塞性能，可以说是兼具易用性与高并发能力的平衡方案。
 


从长远看，这种模式极有可能成为 Java 并发编程的新方向。
 


---
 


**~码文不易，留个赞再走吧~**

---
> 原文链接: [带你轻松学习Spring MVC](https://blog.csdn.net/2401_88959292/article/details/152519551?spm=1001.2014.3001.5501)
> 作者: Yilena
