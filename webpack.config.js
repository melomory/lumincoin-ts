const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const autoprefixer = require("autoprefixer");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const Dotenv = require("dotenv-webpack");

module.exports = (env, argv) => {
  return {
    entry: "./src/app.ts",
    mode: argv.mode,
    devtool: 'inline-source-map',
    output: {
      filename: "app.js",
      path: path.resolve(__dirname, "dist"),
      publicPath: "/",
    },
    devServer: {
      static: {
        directory: path.join(__dirname, "dist"),
      },
      compress: true,
      port: 9000,
      historyApiFallback: true,
    },
    module: {
      rules: [
        {
          test: /\.(sa|sc|c)ss$/i,
          use: [
            argv.mode === "development"
              ? "style-loader"
              : MiniCssExtractPlugin.loader,
            "css-loader",
            {
              loader: "sass-loader",
              options: {
                sassOptions: {
                  silenceDeprecations: [
                    "mixed-decls",
                    "color-functions",
                    "global-builtin",
                    "import",
                  ],
                },
              },
            },
            {
              loader: "postcss-loader",
              options: {
                postcssOptions: {
                  plugins: [autoprefixer],
                },
              },
            },
          ],
        },
        {
          test: /\.tsx?$/,
          use: "ts-loader",
          exclude: /node_modules/,
        },
      ],
    },
    resolve: {
      extensions: [".tsx", ".ts", ".js"],
    },
    plugins: [
      new Dotenv(),
      new HtmlWebpackPlugin({
        template: "src/index.html",
      }),
      new CopyPlugin({
        patterns: [
          {
            from: "src/pages/",
            to: "pages",
            globOptions: {
              dot: true,
              ignore: ["**/.gitkeep"],
            },
          },
          {
            from: "src/layouts/",
            to: "layouts",
            globOptions: {
              dot: true,
              ignore: ["**/.gitkeep"],
            },
          },
          {
            from: "src/assets/images",
            to: "assets/images",
            globOptions: {
              dot: true,
              ignore: ["**/.gitkeep"],
            },
          },
          {
            from: "./node_modules/bootstrap/dist/css/bootstrap.min.css",
            to: "lib/bootstrap/css",
          },
          {
            from: "./node_modules/bootstrap/dist/js/bootstrap.bundle.min.js",
            to: "lib/bootstrap/js",
          },
          {
            from: "./node_modules/@fortawesome/fontawesome-free/webfonts",
            to: "lib/fontawesome-free/webfonts",
          },
          {
            from: "./node_modules/@fortawesome/fontawesome-free/css/all.min.css",
            to: "lib/fontawesome-free/css",
          },
          {
            from: "./.env",
            to: "./",
          },
        ],
      }),
    ].concat(
      argv.mode === "development"
        ? []
        : [
            new MiniCssExtractPlugin({
              filename: "assets/styles/[name].css",
            }),
          ]
    ),
  };
};
