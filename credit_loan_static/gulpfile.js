const gulp = require("gulp");
const htmlmin = require("gulp-htmlmin");

gulp.task("copy",()=>{
	gulp.src(['./src/json/bank.json','./src/json/cardBin.json','./src/json/result.json'])
		.pipe(gulp.dest("./dist/json/"));	
});

gulp.task("img",()=>{
	gulp.src(['./src/images/annual-loan-bottom.jpg','./src/images/annual-loan-top.jpg','./src/images/member-body.jpg','./src/images/member-footer.jpg','./src/images/member-guide.jpg','./src/images/member-head.jpg'])
		.pipe(gulp.dest("./dist/images/"));	
});


/*压缩HTML*/
const minihtmlopts={
    removeComments: true,//清除HTML注释
    collapseWhitespace: true,//压缩HTML
    removeEmptyAttributes: true,//删除所有空格作属性值 <input id="" /> ==> <input />
    removeScriptTypeAttributes: true,//删除<script>的type="text/javascript"
    minifyJS: true,//压缩页面JS
    minifyCSS: true//压缩页面CSS
};
gulp.task("minhtml",()=>{
    gulp.src(["./dist/public/contract.html"])
        .pipe(htmlmin(minihtmlopts))
        .pipe(gulp.dest("./dist/public/"));
});