const path=require("path"),MiniCssExtractPlugin=require("mini-css-extract-plugin"),TerserPlugin=require("terser-webpack-plugin"),CopyPlugin=require("copy-webpack-plugin");module.exports={mode:"production",entry:"./src/injector.js",output:{path:path.resolve(__dirname,"dist"),filename:"squarehero-dashboard-bundle.js",publicPath:"https://cdn.jsdelivr.net/gh/squarehero-store/dashboard@latest/",clean:!0},optimization:{minimize:!0,minimizer:[new TerserPlugin({extractComments:!1})]},module:{rules:[{test:/\.css$/,use:[MiniCssExtractPlugin.loader,"css-loader"]},{test:/\.scss$/,use:[MiniCssExtractPlugin.loader,"css-loader","sass-loader"]},{test:/\.html$/,loader:"html-loader",options:{minimize:!0}},{test:/\.(png|svg|jpg|jpeg|gif)$/i,type:"asset/resource",generator:{filename:"assets/[name][ext]"}},{test:/\.(woff|woff2|eot|ttf|otf)$/i,type:"asset/resource",generator:{filename:"assets/fonts/[name][ext]"}}]},plugins:[new MiniCssExtractPlugin({filename:"squarehero-dashboard-styles.css"}),new CopyPlugin({patterns:[{from:"plugins",to:"plugins",noErrorOnMissing:!0},{from:"*.js",to:"[name][ext]",globOptions:{ignore:["**/node_modules/**","**/dist/**","**/src/**","webpack.config.js"]}},{from:"sh-logo.png",to:"assets",noErrorOnMissing:!0},{from:"sqs-placeholder.jpg",to:"assets",noErrorOnMissing:!0},{from:"login.html",to:"login.html",noErrorOnMissing:!0},{from:"login.css",to:"login.css",noErrorOnMissing:!0},{from:"dashboard-login.css",to:"dashboard-login.css",noErrorOnMissing:!0}]})],devServer:{contentBase:path.join(__dirname,"dist"),compress:!0,port:9e3,headers:{"Cache-Control":"no-store, no-cache, must-revalidate, proxy-revalidate",Pragma:"no-cache",Expires:"0","Surrogate-Control":"no-store"}}};