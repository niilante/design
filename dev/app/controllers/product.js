import mongoose from 'mongoose';
import Product from '../models/product';
import ShoppingCart from '../models/shoppingcart';
import Category from '../models/category';
import elasticsearch from 'elasticsearch';
import { Activity } from '../models/activity';
import {makebulk, indexall, create_doc} from '../search/bulkIndex';
import {create} from '../search/createIndex';
import {search} from '../search/search';
import {esClient} from '../search/client';
import {delete_doc} from '../search/delete_document';
import {update_doc} from '../search/update_document';
import {deletePic} from '../common/delete_file';

// let qs = require('querystring');
// import {base_set,ANCHOR,base_url} from './weixin';


// product list || home
module.exports.list = function(req,res){
  // base_set.scope="snsapi_base";
  // base_set.redirect_uri = encodeURIComponent('http://bestyxie.cn');
  // let snsapi_base = base_url+qs.stringify(base_set)+ANCHOR;
  // console.log(snsapi_base)

  // if(req.session.user){
  //   snsapi_base = false;
  // }
  // console.log(weixin.auth_url);
  let promise = new Promise((resolve,reject) => {
    Activity.find({},(err,acts) => {
      if(err){
        console.log(err);
        reject(err);
      }
      resolve(acts);
    })
  });

  promise.then(acts => {
    Product.find({}).sort({'meta.updateAt':-1}).exec(function(err,products){
      res.render('mobile/home/',{
        products: products,
        acts: acts
        // auth_url: snsapi_base
      });
    })
  }, err => {
    console.log(err);
  })

}

// 商品详情页
module.exports.detail = function(req,res){
  var product_id = req.params.id;
  Product.findOne({_id: product_id},function(err,product){
    if(err){
      console.log(err);
      res.redirect('/');
    }
    res.render('mobile/product_details/',{
      product: product
    });
  });
}

// 新增商品
module.exports.new = function(req,res){
  var new_product = req.body.product;
  var files = req.files;

  new_product.pics = files.map(function(item){
    return '/images/upload/'+item.filename
  });

  Product.findOne({name: new_product.name},function(err,product){
    if(err){
      return console.log(err);
    }
    if(!product || product.length<=0){
      var _product = new Product(new_product);
      _product.save(function(err){
        if(err){
          console.log(err);
          res.redirect('/admin');
        }
        create_doc(_product,res => {
          // console.log(res);
        })
        res.redirect('/admin');
      });
    }
    else{
      console.log("product existed!");
      res.redirect('/admin');
    }
  })
}

// 删除商品
module.exports.delete = function(req,res){
  var product_id  = req.body._id;

  let promise = new Promise( (resolve,reject) => {
    Product.find({ _id : product_id}, (err,prod) => {
      if(err) {
        console.log(err);
        reject();
      }
      else if (prod.length>0) {
        let files = prod[0].pics;
        deletePic(files);
        resolve();
      }else {
        reject();
      }
    })
  });
  promise.then(() => {
    Product.remove({_id: product_id},function(err){
      if(err){
        console.log(err);
        res.json( {success: 0} );
      }
      delete_doc(product_id);
      res.json( {success: 1} );
    })
  },() => {
    console.log('oops!!! 出错啦');
  })
}

// 编辑商品
module.exports.editproduct = function(req,res){
  var product_id = req.params.id,pd;
  var promise = Product.find({_id: product_id}).exec();
  promise.then(function(product){
    pd = product[0];
    return Category.find({},{name: 1,_id: 0}).exec()
  }).then(function(categories){
    res.render('admin/product_management/product_edit',{
      product: pd,
      categories: categories
    });
  })
}

// 更新商品
module.exports.updateproduct = function(req,res){
  var product = req.body.product;
  var files = req.files;
  var deletepic = product.deletepic.split(' ').slice(0,-1);
  product.labels = product.labels.split(' ');
  if(product.labels.length == 1 && product.labels[0] == ''){
    product.labels = [];
  }
  else if(product.labels[0] == ''){
    product.labels.splice(0,1);
    console.log(product.labels);
  }

  var pic_list = [];
  var promise = new Promise((resolve,reject) => {
    Product.find({_id: product._id},(err,prod) => {
      if(err){
        console.log(err);
        reject();
      }
      resolve(prod);
    });
  })
  promise.then((thispro) => {
    thispro = thispro[0];
    var pics = thispro.pics,
        deletepic_url = [];

    pic_list = thispro.pics.filter(function(img,index){
      if(deletepic.indexOf(index+'')<0){
        return img;
      }else{
        deletepic_url.push(thispro.pics[index]);
      }
    });
    deletePic(deletepic_url);

    for(var i = 0;i<files.length;i++){
      pic_list.push('/images/upload/'+files[i].filename);
    }

    product.pics = pic_list;
    try{
      for(let item in product){
        thispro[item] = product[item];
      }
    } catch (err){
      console.log(err);
    }

    thispro.save(function(err){
      if(err){
        console.log(err);
      }
      update_doc(thispro);
      res.redirect('/admin/product/'+product._id);
    })

  },() => {
    res.send('出错啦！！！');
  })
}

module.exports.query = function(req,res){
  var q = req.query.q;
  var type = req.query.type;

  try{
    // let product = []
    let promise = new Promise((resolve,reject) => {
      search({'type':type,'q':q},(result) => {
        // product.concat(result);
        console.log(result);
        resolve(result);
      });
    });

    promise.then((pd)=>{
      console.log(pd);
      search({'type': 'description','q':q},result => {
        result = result.concat(pd);
        for(let i=0,len=result.length;i<len;i++){
          result._source._id = result._id;
          result._source.pics.split(' ');
        }
        res.render('mobile/search/',{
          products: result._source
        });
        // res.send(result);
      });
    });
  } catch(err){
    console.log(err);
  }
  // Product.find({},function(err,products){
  //   if(err){
  //     console.log(err);
  //     res.send('err');
  //   }


  //   // create(products);

  //   // res.send(products);
  // })
}

module.exports.getProduct = function(req,res){
  let curr = req.body.curr;
  let limit = req.body.limit;

  Product.find({},{_id: 1,name: 1,labels: 1,pics: 1}).skip((curr-1)*limit).limit(limit).exec((err,products)=>{
    if(err){
      console.log(err);
      return;
    }
    res.json({prods:products});
  });
}

module.exports.act_prod = function(req,res){
  let act_id = req.params.id;

  Product.find({activity: act_id},(err,prodts) => {
    console.log(prodts);
    res.render('mobile/search/',{
      products: prodts
    })
  })
}