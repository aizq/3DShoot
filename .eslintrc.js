module.exports = {
    "env": {
        "browser": true,
        "es2021": true
    },
    "extends": [
        "eslint:recommended",
        "plugin:vue/vue3-essential",
        "plugin:@typescript-eslint/recommended"
    ],
    "overrides": [
    ],
    "parser": "@typescript-eslint/parser",
    "parserOptions": {
        "ecmaVersion": "latest",
        "sourceType": "module"
    },
    "plugins": [
        "vue",
        "@typescript-eslint"
    ],
    "rules": {
        "@typescript-eslint/no-non-null-assertion": "off",   //非空检测
        "@typescript-eslint/no-empty-function": "warn",      //空函数
        "@typescript-eslint/no-unused-vars": "off",         //不能有声明后未被使用的变量或参数
        "@typescript-eslint/no-inferrable-types": "off",         //不允许对参数、变量和属性进行显式类型声明
        "prefer-const": 0,//首选const
        "@typescript-eslint/no-explicit-any": "warn",   //不允许any定义类型  const capitalObj: { a: string } = { a: 'string' };
        "@typescript-eslint/no-extra-semi": "error",//禁止多余的冒号
        "@typescript-eslint/no-this-alias": [    //this 
            "error",
            {
                "allowedNames": ["self"] // Allow `const vm= this`; `[]` by default
            }
        ],
        "@typescript-eslint/ban-types": [
            "error",
            {
                "types": {
                    "Function": {
                        "message": "Please use the MFunction"
                    },
                },
            }
        ],
        "@typescript-eslint/no-empty-function": "off",  //"空函数"
        "@typescript-eslint/no-empty-interface": "off", //"空的接口"
        "@typescript-eslint/array-type": "warn", //"数组定义规则"
        // "@typescript-eslint/type-annotation": "warn", //"强制在类型注释或构造函数调用的构造函数名称上指定泛型类型参数。"
        // "@typescript-eslint/explicit-function-return-type": "warn", //"函数返回类型"
        "@typescript-eslint/naming-convention": [           //命名约定   强制所有变量、函数和属性遵循驼峰命名 
            "error",
            { "selector": "variableLike", "format": ["camelCase"] },

        ],
        "@typescript-eslint/naming-convention": [           //命名约定   所有的私有属性必须带有下划线
            "error",
            { "selector": "property", "format": ["camelCase"], "modifiers": ['private',], "leadingUnderscore": "require" },
        ],
        // "@typescript-eslint/naming-convention": [           //命名约定
        //     "error",
        //     { "selector": "variable", "format": ["camelCase", "UPPER_CASE"], "leadingUnderscore": "allow" }, //强制所有变量都使用 camelCase 或UPPER_CASE
        // ],

        // "@typescript-eslint/naming-convention": [           //命名约定
        //     "error",
        //     { "selector": "variable", "types": ["boolean"], "format": ["camelCase"], "prefix": ["is", "should", "has", "can", "did", "will"] },  //强制布尔类型前缀
        // ]
        "@typescript-eslint/no-duplicate-enum-values": "error",  //没有重复枚举值

    }
    //https://typescript-eslint.io/rules/no-inferrable-types/
    //https://www.jianshu.com/p/2f1203bdc573
}
