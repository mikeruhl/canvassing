import React from "react";
import ReactDOM from "react-dom";
import { fabric } from "fabric";
import { SketchPicker } from "react-color";
import FontPicker from "font-picker-react";
import Popup from "reactjs-popup";
import { getOffset, saveCanvasState, selectObject } from "./Helpers";
import { Container, Collapse } from "reactstrap";
import $ from "jquery";

class Toolbar extends React.Component {
  state = {
    value: "6",
    opacityval: "1",
    strokeval: "1",
    blurval: "1",
    glowcolor: "",
    offsetX: "1",
    offsetY: "1",
    activeFontFamily: "Open Sans",
    savestateaction: true,
    displayColorPicker: false,
    displaystrokeColorPicker: false,
    displayglowColorPicker: false,
    collapse: false,
    glowcollapse: false,
    styles: {
      position: "absolute",
      display: "none",
    },
  };

  componentDidMount() {
    $(".strokeeff").hide();
    $(".iconbar").hide();
  }

  componentWillReceiveProps = (newprops) => {
    var canvas = this.props.state.canvas;
    if (canvas) {
      var activeObject = canvas.getActiveObject();
      var left = getOffset("main-canvas").left;
      var top = getOffset("main-canvas").top;
      if (activeObject) {
        this.setState({
          styles: {
            top: activeObject.top + top - 50,
            left:
              activeObject.left +
              left +
              (activeObject.width * activeObject.scaleX) / 2 +
              10,
            position: "fixed",
            display: "block",
            zIndex: 1000,
          },
        });
      } else {
        this.setState({
          styles: {
            display: "none",
          },
        });
      }
    }
    this.selobject();
  };

  selobject = () => {
    var canvas = this.props.state.canvas;
    if (canvas) {
      var activeObject = canvas.getActiveObject();
      if (!activeObject) return false;
      if (activeObject.type === "text") {
        this.setState({
          value: activeObject.fontSize,
        });
        this.setState({
          activeFontFamily: activeObject.fontFamily,
        });
        this.setState({
          opacityval: activeObject.opacity,
        });

        $(".textcolpick").css("background", activeObject.fill);

        if (activeObject.fontWeight === "bold") {
          $(".tbold").css("opacity", "1");
        } else {
          $(".tbold").css("opacity", "0.5");
        }
        if (activeObject.fontStyle === "italic") {
          $(".titalic").css("opacity", "1");
        } else {
          $(".titalic").css("opacity", "0.5");
        }
        if (activeObject.underline === "underline") {
          $(".tunder").css("opacity", "1");
        } else {
          $(".tunder").css("opacity", "0.5");
        }
        if (activeObject.textAlign === "left") {
          $(".tleft").css("opacity", "1");
        } else {
          $(".tleft").css("opacity", "0.5");
        }
        if (activeObject.textAlign === "center") {
          $(".tcenter").css("opacity", "1");
        } else {
          $(".tcenter").css("opacity", "0.5");
        }
        if (activeObject.textAlign === "right") {
          $(".tright").css("opacity", "1");
        } else {
          $(".tright").css("opacity", "0.5");
        }
      }

      if (activeObject.type === "path") {
        this.setState({
          opacityval: activeObject.opacity,
        });
        this.setState({
          strokeval: activeObject.strokeWidth,
        });
      }

      if (activeObject.type === "group") {
        this.setState({
          opacityval: activeObject.opacity,
        });
        this.setState({
          strokeval: activeObject.strokeWidth,
        });
      }
    }
  };

  setStyle = (styleName, value, o) => {
    if (o.setSelectionStyles && o.isEditing) {
      var style = {};
      style[styleName] = value;
      o.setSelectionStyles(style);
    } else {
      o.set(styleName, value);
    }
    o.setCoords();
  };

  setActiveStyle(styleName, value, object) {
    var canvas = this.props.state.canvas;
    object = object || canvas.getActiveObject();

    if (!object) return;
    if (object.setSelectionStyles && object.isEditing) {
      var style = {};
      style[styleName] = value;
      object.setSelectionStyles(style);
      object.setCoords();
    } else {
      object.set(styleName, value);
    }
    object.setCoords();
    canvas.renderAll();
  }

  setTextFont = (fontfamily) => {
    this.setState({
      activeFontFamily: fontfamily,
    });
    this.setActiveStyle("fontFamily", fontfamily);
  };

  setTextBold = () => {
    var fontBoldValue =
      this.props.state.fontBoldValue === "normal" ? "bold" : "normal";
    this.setActiveStyle("fontWeight", fontBoldValue);
    this.props.state.fontBoldValue = fontBoldValue;
  };

  setTextItalic = () => {
    var fontItalicValue =
      this.props.state.fontItalicValue === "normal" ? "italic" : "normal";
    this.setActiveStyle("fontStyle", fontItalicValue);
    this.props.state.fontItalicValue = fontItalicValue;
  };

  setTextUnderline = () => {
    var fontUnderlineValue = !this.props.state.fontUnderlineValue
      ? "underline"
      : false;
    this.setActiveStyle("underline", fontUnderlineValue);
    this.props.state.fontUnderlineValue = fontUnderlineValue;
  };

  setActiveProp = (name, value) => {
    var canvas = this.props.state.canvas;
    var activeObject = canvas.getActiveObject();
    if (!activeObject) return;
    if (activeObject.type === "activeSelection") {
      activeObject.forEachObject(function (object) {
        object.set(name, value).setCoords();
      });
    } else if (activeObject) {
      activeObject.set(name, value).setCoords();
    }
    canvas.renderAll();
    saveCanvasState(canvas);
  };

  alignObjectLeft = (value) => {
    this.setActiveProp("textAlign", "left");
  };

  alignObjectCenter = () => {
    this.setActiveProp("textAlign", "center");
  };

  alignObjectRight = () => {
    this.setActiveProp("textAlign", "right");
  };

  clearCanvas = () => {
    var canvas = this.props.state.canvas;
    canvas.clear();
  };

  deleteItem = () => {
    var canvas = this.props.state.canvas;
    var activeObject = canvas.getActiveObject();
    if (!activeObject) return;
    if (activeObject.type === "activeSelection") {
      activeObject.forEachObject(function (object) {
        canvas.remove(object);
      });
    } else {
      canvas.remove(activeObject);
    }
  };

  setColor = (color) => {
    this.changeObjectColor(color.hex);
    ReactDOM.findDOMNode(this.refs.textcolor).style.background = color.hex;
  };

  pickerOpen = () => {
    this.setState({
      displayColorPicker: !this.state.displayColorPicker,
    });
  };

  pickerClose = () => {
    this.setState({
      displayColorPicker: false,
    });
  };

  strokepickerOpen = () => {
    this.setState({
      displaystrokeColorPicker: !this.state.displaystrokeColorPicker,
    });
  };

  strokepickerClose = () => {
    this.setState({
      displaystrokeColorPicker: false,
    });
  };

  glowpickerOpen = () => {
    this.setState({
      displayglowColorPicker: !this.state.displayglowColorPicker,
    });
  };

  glowpickerClose = () => {
    this.setState({
      displayglowColorPicker: false,
    });
  };

  setStroke = (color) => {
    this.changeObjectproperty("stroke", color.hex);
    ReactDOM.findDOMNode(this.refs.textstrokecol).style.background = color.hex;
  };

  changeObjectColor = (hex) => {
    this.changeObjectproperty("fill", hex);
  };

  changeObjectproperty(style, hex) {
    let lthis = this;
    var canvas = this.props.state.canvas;
    let obj = canvas.selectedObject;

    if (!obj) obj = canvas.getActiveObject();

    if (obj) {
      if (obj.paths) {
        for (let i = 0; i < obj.paths.length; i++) {
          this.setActiveStyle(style, hex, obj.paths[i]);
        }
      } else if (obj.type === "group") {
        let objects = obj.getObjects();
        for (let i = 0; i < objects.length; i++) {
          this.setActiveStyle(style, hex, objects[i]);
        }
      } else this.setActiveStyle(style, hex, obj);
    } else {
      let grpobjs = canvas.getActiveObjects();
      if (grpobjs) {
        grpobjs.forEach(function (object) {
          if (object.paths) {
            for (let i = 0; i < object.paths.length; i++) {
              lthis.setActiveStyle(style, hex, obj.paths[i]);
            }
          } else lthis.setActiveStyle(style, hex, obj);
        });
      }
    }
    canvas.renderAll();
    saveCanvasState(canvas);
  }

  fontSize = (event) => {
    this.setState({
      value: event.target.value,
    });
    this.setActiveStyle("fontSize", event.target.value);
  };

  clone = () => {
    var canvas = this.props.state.canvas;
    var activeObject = canvas.getActiveObject();
    if (!activeObject) return false;
    if (activeObject.type === "activeSelection") {
      activeObject.forEachObject((object) => {
        this.cloneSelObject(object);
      });
    } else {
      this.cloneSelObject(activeObject);
    }
  };

  cloneSelObject = (actobj) => {
    var canvas = this.props.state.canvas;
    canvas.discardActiveObject();
    if (fabric.util.getKlass(actobj.type).async) {
      var clone = fabric.util.object.clone(actobj);
      clone.set({
        left: actobj.left + 50,
        top: actobj.top + 50,
      });
      canvas.add(clone);
      saveCanvasState(canvas);
    } else {
      var clones = fabric.util.object.clone(actobj);
      canvas.add(
        clones.set({
          left: actobj.left + 50,
          top: actobj.top + 50,
        })
      );
      saveCanvasState(canvas);
    }
    canvas.requestRenderAll();
  };

  setOpacity = (event) => {
    this.setState({
      opacityval: event.target.value,
    });
    this.setActiveStyle("opacity", event.target.value / 100);
  };

  setStrokeval = (event) => {
    console.log(event.target.value);
    this.setState({
      strokeval: event.target.value,
    });
    this.changeObjectproperty("strokeWidth", event.target.value * 1);
  };

  outlinetoggle = () => {
    this.setState({
      collapse: !this.state.collapse,
    });
  };

  setGlow = (color) => {
    ReactDOM.findDOMNode(this.refs.textglowcol).style.background = color.hex;
    this.setState({
      glowcolor: color.hex,
    });
    var canvas = this.props.state.canvas;
    var activeObject = canvas.getActiveObject();
    if (activeObject) {
      activeObject.setShadow({
        color: color.hex,
        blur: 1,
        offsetX: 1,
        offsetY: 1,
      });
    }
    canvas.renderAll();
  };

  setglowblur = (event) => {
    this.setState({
      blurval: event.target.value,
    });
    var canvas = this.props.state.canvas;
    var activeObject = canvas.getActiveObject();
    if (activeObject) {
      activeObject.setShadow({
        blur: event.target.value,
        color: this.state.glowcolor,
        offsetX: this.state.offsetX,
        offsetY: this.state.offsetY,
      });
    }
    canvas.renderAll();
  };

  setglowoffsetX = (event) => {
    this.setState({
      offsetX: event.target.value,
    });
    var canvas = this.props.state.canvas;
    var activeObject = canvas.getActiveObject();
    if (activeObject) {
      activeObject.setShadow({
        blur: this.state.blurval,
        color: this.state.glowcolor,
        offsetX: event.target.value,
        offsetY: "",
      });
    }
    canvas.renderAll();
  };

  setglowoffsetY = (event) => {
    this.setState({
      offsetY: event.target.value,
    });
    var canvas = this.props.state.canvas;
    var activeObject = canvas.getActiveObject();
    if (activeObject) {
      activeObject.setShadow({
        blur: this.state.blurval,
        color: this.state.glowcolor,
        offsetX: this.state.offsetX,
        offsetY: event.target.value,
      });
    }
    canvas.renderAll();
  };

  glowtoggle = () => {
    this.setState({
      glowcollapse: !this.state.glowcollapse,
    });
  };

  bringForward = () => {
    var canvas = this.props.state.canvas;
    var activeObject = canvas.getActiveObject();
    var grpobjs = canvas.getActiveObjects();
    if (grpobjs) {
      grpobjs.forEach((object) => {
        canvas.bringForward(object);
        canvas.renderAll();
        saveCanvasState(canvas);
      });
    } else {
      canvas.bringForward(activeObject);
      canvas.renderAll();
      saveCanvasState(canvas);
    }
  };

  sendBackward = () => {
    var canvas = this.props.state.canvas;
    var activeObject = canvas.getActiveObject();
    var grpobjs = canvas.getActiveObjects();
    if (grpobjs) {
      grpobjs.forEach((object) => {
        canvas.sendBackwards(object);
        canvas.renderAll();
        saveCanvasState(canvas);
      });
    } else {
      canvas.sendBackwards(activeObject);
      canvas.renderAll();
      saveCanvasState(canvas);
    }
  };

  groupItems = () => {
    var canvas = this.props.state.canvas;
    if (!canvas.getActiveObject()) {
      return;
    }
    if (canvas.getActiveObject().type !== "activeSelection") {
      return;
    }
    canvas.getActiveObject().toGroup();
    selectObject(canvas);
    canvas.renderAll();
  };

  unGroupItems = () => {
    var canvas = this.props.state.canvas;
    if (!canvas.getActiveObject()) {
      return;
    }
    if (canvas.getActiveObject().type !== "group") {
      return;
    }
    canvas.getActiveObject().toActiveSelection();
    selectObject(canvas);
    canvas.renderAll();
  };

  render() {
    const popover = {
      position: "absolute",
      zIndex: "2",
      top: "65px",
      left: "400px",
    };
    const cover = {
      position: "fixed",
      top: "0px",
      right: "0px",
      bottom: "0px",
      left: "0px",
    };
    const strokepopover = {
      position: "absolute",
      zIndex: "2",
      top: "150px",
      left: "250px",
    };
    const strokecover = {
      position: "fixed",
      top: "0px",
      right: "0px",
      bottom: "0px",
      left: "0px",
    };
    const glowpopover = {
      position: "absolute",
      zIndex: "2",
      top: "150px",
      left: "250px",
    };
    const glowcover = {
      position: "fixed",
      top: "0px",
      right: "0px",
      bottom: "0px",
      left: "0px",
    };

    const { canvas } = this.props.state;
    if (canvas) {
      const activeObject = canvas.getActiveObject();
      if (!activeObject) {
        return null;
      }
    } else {
      return null;
    }

    return (
      <Container className="toolbar-container">
        <div className="leftbar">
          <div title="Font Family" className="font-familiy-container">
            <div>
              <FontPicker
                ref={(c) => (this.pickerRef = c)}
                apiKey="AIzaSyCOyeDUsAnL-jnWudXBKNNma9cXmXsT4tM"
                activeFontFamily={this.state.activeFontFamily}
                limit="150"
                onChange={(nextFont) => this.setTextFont(nextFont.family)}
              />
              <img
                className="arrowimg"
                src={require("../images/down-arrow.png")}
                alt=""
              />
            </div>
          </div>

          <div className="select-container font-size-container">
            <select onChange={this.fontSize} value={this.state.value}>
              <option>6</option>
              <option>8</option>
              <option>10</option>
              <option>12</option>
              <option>14</option>
              <option>16</option>
              <option>18</option>
              <option>21</option>
              <option>24</option>
              <option>28</option>
              <option>32</option>
              <option>36</option>
              <option>42</option>
              <option>48</option>
              <option>56</option>
              <option>64</option>
              <option>72</option>
              <option>80</option>
              <option>88</option>
              <option>96</option>
              <option>104</option>
              <option>120</option>
              <option>144</option>
            </select>
            <img
              className="arrowimg"
              src={require("../images/down-arrow.png")}
              alt=""
            />
          </div>

          <div className="font-color-container">
            <div className="colrsec" onClick={this.pickerOpen}>
              <div ref="textcolor" className="primcol textcolpick" />
              <img
                className="arrowimg"
                src={require("../images/down-arrow.png")}
                alt=""
              />
            </div>
          </div>

          {this.state.displayColorPicker ? (
            <div style={popover}>
              <div style={cover} onClick={this.pickerClose} />
              <SketchPicker
                color={this.state.background}
                onChangeComplete={this.setColor}
              />
            </div>
          ) : null}

          <div className="font-style-container">
            <div title="Bold" onClick={this.setTextBold} className="txtbold">
              <img
                className="toolbar-icon tbold"
                src={require("../images/bold.png")}
                alt=""
              />
            </div>
            <div
              title="Italic"
              onClick={this.setTextItalic}
              className="txtitalic"
            >
              <img
                className="toolbar-icon titalic"
                src={require("../images/italic.png")}
                alt=""
              />
            </div>
            <div
              title="Underline"
              onClick={this.setTextUnderline}
              className="txtunder"
            >
              <img
                className="toolbar-icon tunder"
                src={require("../images/underline.png")}
                alt=""
              />
            </div>
          </div>

          <div className="font-style-container">
            <div
              title="Left"
              onClick={this.alignObjectLeft}
              className="txtleft"
            >
              <img
                className="toolbar-icon tleft"
                src={require("../images/align-to-left.png")}
                alt=""
              />
            </div>
            <div
              title="Center"
              onClick={this.alignObjectCenter}
              className="txtcenter"
            >
              <img
                className="toolbar-icon tcenter"
                src={require("../images/center-paragraph.png")}
                alt=""
              />
            </div>
            <div
              title="Right"
              onClick={this.alignObjectRight}
              className="txtright"
            >
              <img
                className="toolbar-icon tright"
                src={require("../images/align-to-right.png")}
                alt=""
              />
            </div>
          </div>

          <div className="overlap-container">
            <div
              title="Send Back"
              onClick={this.sendBackward}
              className="sendback"
            >
              <img
                className="overlapArrow"
                src={require("../images/send-backward.svg")}
                alt=""
              />
            </div>
            <div
              title="Bring Forward"
              onClick={this.bringForward}
              className="sendforward "
            >
              <img
                className="overlapArrow"
                src={require("../images/bring-forward.svg")}
                alt=""
              />
            </div>
          </div>

          <div className="overlap-container">
            <div
              title="Group"
              onClick={this.groupItems}
              className="sendforward group"
            >
              <i className="arrow fa fa-object-group" aria-hidden="true"></i>
            </div>
            <div
              title="Ungroup"
              onClick={this.unGroupItems}
              className="sendforward ungroup"
            >
              <i className="arrow fa fa-object-ungroup" aria-hidden="true"></i>
            </div>
          </div>

          <div title="Effects" className="txteff">
            <Popup
              className="popupcontent"
              trigger={<div className="toolbar-label">Effects</div>}
              position="bottom center"
              closeOnDocumentClick
            >
              <div className="effects">
                <div className="opacity-section">
                  <div className="toolbar-label opacity">Opacity</div>
                  <div className="slider-view">
                    <input
                      type="range"
                      className="slider opacityslider"
                      max="100"
                      min="0"
                      step="5"
                      onChange={this.setOpacity}
                      value={this.state.opacityval}
                    />
                    <div>{this.state.opacityval}%</div>
                  </div>
                </div>

                <div className="effsection separator">
                  <div className="toolbar-label">Outline</div>
                  <div className="control">
                    <input type="checkbox" id="switch" />
                    <label htmlFor="switch" onClick={this.outlinetoggle}>
                      Toggle
                    </label>
                  </div>
                </div>
                <Collapse
                  isOpen={this.state.collapse}
                  className="strokesection"
                >
                  <div className="effsection">
                    <div className="toolbar-label">Color</div>
                    <div className="font-color-container">
                      <div className="colrsec" onClick={this.strokepickerOpen}>
                        <div
                          ref="textstrokecol"
                          className="primcol textcolpick"
                        />
                        <img
                          className="arrowimg"
                          src={require("../images/down-arrow.png")}
                          alt=""
                        />
                      </div>
                    </div>
                    {this.state.displaystrokeColorPicker ? (
                      <div style={strokepopover}>
                        <div
                          style={strokecover}
                          onClick={this.strokepickerClose}
                        />
                        <SketchPicker
                          color={this.state.background}
                          onChangeComplete={this.setStroke}
                        />
                      </div>
                    ) : null}
                  </div>
                  <div className="effsection">
                    <div className="toolbar-label">Width</div>
                    <div className="slider-view">
                      <input
                        type="range"
                        className="slider widthslider"
                        max="5"
                        min="1"
                        step="1"
                        onChange={this.setStrokeval}
                        value={this.state.strokeval}
                      />
                      <div>{this.state.strokeval}</div>
                    </div>
                  </div>
                </Collapse>

                <div className="effsection separator">
                  <div className="toolbar-label">Glow</div>
                  <div className="control">
                    <input type="checkbox" id="switch1" />
                    <label htmlFor="switch1" onClick={this.glowtoggle}>
                      Toggle
                    </label>
                  </div>
                </div>
                <Collapse
                  isOpen={this.state.glowcollapse}
                  className="glowsection"
                >
                  <div className="effsection">
                    <div className="toolbar-label">Color</div>
                    <div className="font-color-container">
                      <div className="colrsec" onClick={this.glowpickerOpen}>
                        <div
                          ref="textglowcol"
                          className="primcol textcolpick"
                        />
                        <img
                          className="arrowimg"
                          src={require("../images/down-arrow.png")}
                          alt=""
                        />
                      </div>
                    </div>
                    {this.state.displayglowColorPicker ? (
                      <div style={glowpopover}>
                        <div style={glowcover} onClick={this.glowpickerClose} />
                        <SketchPicker
                          color={this.state.background}
                          onChangeComplete={this.setGlow}
                        />
                      </div>
                    ) : null}
                  </div>
                  <div className="effsection">
                    <div className="toolbar-label">offsetX</div>
                    <div className="slider-view">
                      <input
                        type="range"
                        className="slider widthslider"
                        max="10"
                        min="1"
                        step="1"
                        onChange={this.setglowoffsetX}
                        value={this.state.offsetX}
                      />
                      <div>{this.state.offsetX}%</div>
                    </div>
                  </div>
                  <div className="effsection">
                    <div className="toolbar-label">offsetY</div>
                    <div className="slider-view">
                      <input
                        type="range"
                        className="slider widthslider"
                        max="10"
                        min="1"
                        step="1"
                        onChange={this.setglowoffsetY}
                        value={this.state.offsetY}
                      />
                      <div>{this.state.offsetY}%</div>
                    </div>
                  </div>
                  <div className="effsection">
                    <div className="toolbar-label">Blur</div>
                    <div className="slider-view">
                      <input
                        type="range"
                        className="slider widthslider"
                        max="10"
                        min="1"
                        step="1"
                        onChange={this.setglowblur}
                        value={this.state.blurval}
                      />
                      <div>{this.state.blurval}%</div>
                    </div>
                  </div>
                </Collapse>
              </div>
            </Popup>
          </div>

          <div title="Effects" className="strokeeff">
            <Popup
              className="popupcontent"
              trigger={<div className="toolbar-label">Stroke</div>}
              position="bottom center"
              closeOnDocumentClick
            >
              <span>
                <div className="effects">
                  <div className="effsection">
                    <div className="toolbar-label stroke-label">
                      Stroke Color
                    </div>
                    <div className="font-color-container">
                      <div className="colrsec" onClick={this.strokepickerOpen}>
                        <div
                          ref="textstrokecol"
                          className="primcol strokecolpick"
                        />
                        <img
                          className="arrowimg"
                          src={require("../images/down-arrow.png")}
                          alt=""
                        />
                      </div>
                      {this.state.displaystrokeColorPicker ? (
                        <div style={strokepopover} className="strokecolpic">
                          <div
                            style={strokecover}
                            onClick={this.strokepickerClose}
                          />
                          <SketchPicker
                            color={this.state.background}
                            onChangeComplete={this.setStroke}
                          />
                        </div>
                      ) : null}
                    </div>
                  </div>
                  <hr />
                  <div className="effsection">
                    <div className="toolbar-label stroke-label">
                      Stroke Width
                    </div>
                    <div className="slider-view">
                      <input
                        type="range"
                        className="slider strokeslider"
                        max="10"
                        min="1"
                        step="1"
                        onChange={this.setStrokeval}
                        value={this.state.strokeval}
                      />
                      <div>{this.state.strokeval}%</div>
                    </div>
                  </div>
                </div>
              </span>
            </Popup>
          </div>
        </div>
        <div className="rightbar">
          <div
            title="Duplicate"
            className="toolbar-label btn-duplicate"
            onClick={this.clone}
          >
            Duplicate
          </div>
          <div title="Delete" className="btn-delete" onClick={this.deleteItem}>
            <img
              className="arrow"
              src={require("../images/delete.png")}
              alt=""
            />
          </div>
        </div>
      </Container>
    );
  }
}

export default Toolbar;
