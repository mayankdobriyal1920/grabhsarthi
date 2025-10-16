import React from 'react';

export const FacebookLoader = ({type,item})=>{
    const renderLoaderMobile = (item)=>{
        let loaderData = [];
        for (let i = 0;i < item;i++){
            loaderData.push(<div key={i} className={"row"}>
                <div className={"col-3"}>
                    <div className="panel-effect front_line"></div>
                </div>
                <div className={"col-9"}>
                    <div className="panel-effect l1"></div>
                    <div className="panel-effect l2"></div>
                    <div className="panel-effect l3"></div>
                    <div className="panel-effect l4"></div>
                    <div className="panel-effect l5"></div>
                </div>
            </div>);
        }
        return loaderData;
    }
    const renderLoader = (item)=>{
        let loaderData = [];
        for (let i = 0;i < item;i++){
            loaderData.push(<div key={i} className={"row"}>
                <div className={"col-1"}>
                    <div className="panel-effect front_line"></div>
                </div>
                <div className={"col-11"}>
                    <div className="panel-effect l1"></div>
                    <div className="panel-effect l2"></div>
                    <div className="panel-effect l3"></div>
                    <div className="panel-effect l4"></div>
                    <div className="panel-effect l5"></div>
                </div>
            </div>);
        }
        return loaderData;
    }

    const renderBigLoader = (item)=>{
        let loaderData = [];
        for (let i = 0;i < item;i++){
            loaderData.push(<div key={i} className={"row"}>
                <div className={"col-2"}>
                    <div className="panel-effect front_line_big_loader"></div>
                </div>
                <div className={"col-10"}>
                    <div className="panel-effect l1"></div>
                    <div className="panel-effect l2"></div>
                    <div className="panel-effect l3"></div>
                    <div className="panel-effect l4"></div>
                    <div className="panel-effect l5"></div>
                    <div className="panel-effect l6"></div>
                    <div className="panel-effect l7"></div>
                    <div className="panel-effect l8"></div>
                </div>
            </div>);
        }
        return loaderData;
    }
    return (
        <>
            {(type === 'appLoader') ?
                <svg version="1.1" id="L6" xmlns="http://www.w3.org/2000/svg"  y="0px" viewBox="0 0 100 100" enableBackground="new 0 0 100 100"><rect fill="none" stroke="#fff" strokeWidth="4" x="25" y="25" width="50" height="50"><animateTransform attributeName="transform" dur="0.5s" from="0 50 50" to="180 50 50" type="rotate" id="strokeBox" attributeType="XML" begin="rectBox.end"/></rect><rect x="27" y="27" fill="#fff" width="46" height="50"><animate attributeName="height" dur="1.3s" attributeType="XML" from="50" to="0" id="rectBox" fill="freeze" begin="0s;strokeBox.end"/></rect></svg>
                : (type === 'facebookStyle') ?
                    <div className={"facebook_style_loader_container"}>
                        {renderLoader(item)}
                    </div>
                    : (type === 'facebookStyleBigLoader') ?
                        <div className={"facebook_style_big_loader_container"}>
                            {renderBigLoader(item)}
                        </div>
                        :(type === 'facebookStyleMobileLoader') ?
                            <div className={"facebook_style_loader_container"}>
                                {renderLoaderMobile(item)}
                            </div>
                            :
                            ''
            }
            <style>
                {
                    `
                    Loader@keyframes anim {
                      0% {
                        background-position: -468px 0;
                      }
                      100% {
                        background-position: 468px 0;
                      }
                    }
                    @-o-keyframes anim {
                      0% {
                        background-position: -468px 0;
                      }
                      100% {
                        background-position: 468px 0;
                      }
                    }
                    @-ms-keyframes anim {
                      0% {
                        background-position: -468px 0;
                      }
                      100% {
                        background-position: 468px 0;
                      }
                    }
                    @-moz-keyframes anim {
                      0% {
                        background-position: -468px 0;
                      }
                      100% {
                        background-position: 468px 0;
                      }
                    }
                    @-webkit-keyframes anim {
                      0% {
                        background-position: -468px 0;
                      }
                      100% {
                        background-position: 468px 0;
                      }
                    }
                    .facebook_style_loader_container {
                      width: 100%;
                    }
                    .facebook_style_loader_container .row {
                      margin-bottom: 10px;
                    }
                    .facebook_style_big_loader_container .row {
                      margin-bottom: 40px;
                    }
                    .panel-effect {
                      position: relative;
                      background: #f6f7f8 no-repeat 800px 104px;
                      background-image: url('data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4gPHN2ZyB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJncmFkIiBncmFkaWVudFVuaXRzPSJvYmplY3RCb3VuZGluZ0JveCIgeDE9IjAuMCIgeTE9IjAuNSIgeDI9IjEuMCIgeTI9IjAuNSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iI2Y2ZjdmOCIvPjxzdG9wIG9mZnNldD0iMjAlIiBzdG9wLWNvbG9yPSIjZWRlZWYxIi8+PHN0b3Agb2Zmc2V0PSI0MCUiIHN0b3AtY29sb3I9IiNmNmY3ZjgiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNmNmY3ZjgiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB4PSIwIiB5PSIwIiB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyYWQpIiAvPjwvc3ZnPiA=');
                      background-size: 100%;
                      background-image: -webkit-gradient(linear, 0% 50%, 100% 50%, color-stop(0%, #f6f7f8), color-stop(20%, #edeef1), color-stop(40%, #f6f7f8), color-stop(100%, #f6f7f8));
                      background-image: -moz-linear-gradient(left, #f6f7f8 0%, #edeef1 20%, #f6f7f8 40%, #f6f7f8 100%);
                      background-image: -webkit-linear-gradient(left, #f6f7f8 0%, #edeef1 20%, #f6f7f8 40%, #f6f7f8 100%);
                      background-image: linear-gradient(to right, #f6f7f8 0%, #edeef1 20%, #f6f7f8 40%, #f6f7f8 100%);
                      height: 8px;
                      -moz-animation: anim 1s forwards infinite linear;
                      -webkit-animation: anim 1s forwards infinite linear;
                      animation: anim 1s forwards infinite linear;
                      margin-bottom: 10px;
                    }
                    .panel-effect.front_line {
                      height: 89%!important;
                    }
                    .panel-effect.front_line_big_loader {
                      height: 93%!important;
                    }
                    .panel-effect.l2 {
                      width: 90%;
                    }
                    .panel-effect.l3 {
                      width: 80%;
                    }
                    .panel-effect.l4 {
                      width: 70%;
                    }
                    .panel-effect.l5 {
                      width: 60%;
                    }
                    .panel-effect.l6 {
                      width: 50%;
                    }
                    .panel-effect.l7 {
                      width: 40%;
                    }
                    .panel-effect.l8 {
                      width: 30%;
                    }
                    `
                }
            </style>
        </>
    )
}