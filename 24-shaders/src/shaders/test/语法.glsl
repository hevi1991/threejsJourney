precision mediump float;

/// function
float sumAB(float a, float b) {
    return a + b;
}

void main() {

    /// 下面是一些glsl的语法
    // varible
    // float 
    float a = 1.0;
    float b = -1.0;
    float c = a + b;

    // int
    int foo = 123;
    int bar = -1;

    float foobar = float(foo) * float(bar); // convert

    // bool
    bool boolFoo = true;
    bool boolBar = false;

    // built-in type
    // vec2
    vec2 vec2Foo1 = vec2(1.0); // x1.0 y1.0
    vec2Foo1.x = 3.0; // x3.0 y1.0
    vec2Foo1.y = 2.2; // x3.0 y2.2
    vec2 vec2Foo2 = vec2(1.0, 2.0); // x1.0 y2.0
    vec2Foo2 *= 2.0; // x2.0 y4.0

    // vec3
    vec3 vec3Foo1 = vec3(0.0); // x0.0 y0.0 z0.0 其他跟vec2一样
    vec3Foo1.x = 1.0;
    vec3Foo1.y = 2.0;
    vec3Foo1.z = 3.0;
    vec3Foo1.r = 0.1; // x 的别名
    vec3Foo1.g = 0.2; // y 的别名
    vec3Foo1.b = 0.3; // z 的别名
    vec3 vec3Foo2 = vec3(0.0, 1.0, 2.0);
    vec2 vec2Foo3 = vec3Foo1.xy; // 以vec3Foo1的x,y属性作为它的x,y。语法糖

    // vec4
    vec4 vec4Foo = vec4(0.1, 0.2, 0.3, 0.4);
    vec4Foo.x = 0.5;
    vec4Foo.y = 0.6;
    vec4Foo.z = 0.7;
    vec4Foo.w = 0.8;
    vec4Foo.r = 0.5; // x 的别名
    vec4Foo.g = 0.6; // y 的别名
    vec4Foo.b = 0.7; // z 的别名
    vec4Foo.a = 0.8; // w 的别名

    // function
    float funcC = sumAB(1.0, 2.0);
    /* built-in function
    Many built-in classic functions sin, cos, max, min, pow exp, mod, clamp but also very practical functions like cross, dot, mix, step, smoothstep
    length, distance, reflect, refract, normalize
    */

}
