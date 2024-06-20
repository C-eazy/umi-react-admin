import { iconData } from '@/utils/MapCompute/dataEnd';
import { ProCard } from '@ant-design/pro-components';
import { Alert, Button } from 'antd';
import * as Cesium from 'cesium';
import 'cesium/Build/Cesium/Widgets/widgets.css';
import React, { useEffect, useState } from 'react';

const Trajectory: React.FC = () => {
  Cesium.Ion.defaultAccessToken = CESIUM_ION_TOKEN as string;
  const [viewer, setViewer] = useState(null as any);

  useEffect(() => {
    // 创建一个 Cesium Viewer 实例
    const viewer = new Cesium.Viewer('cesiumContainer', {
      // 去除所有的控件
      animation: false, // 是否显示动画控件
      // baseLayerPicker: false, // 是否显示图层选择控件
      // fullscreenButton: false, // 是否显示全屏按钮
      // geocoder: false, // 是否显示地名查找控件
      // homeButton: false, // 是否显示Home按钮
      infoBox: false, // 是否显示信息框
      sceneModePicker: true, // 是否显示3D/2D选择器
      selectionIndicator: false, // 是否显示选取指示器组件
      timeline: false, // 是否显示时间轴
      navigationHelpButton: false, // 是否显示帮助信息按钮
      navigationInstructionsInitiallyVisible: false, // 是否显示导航指示
      // scene3DOnly: true, // 是否只显示3D
      shouldAnimate: true, // 是否显示动画
      skyAtmosphere: false, // 是否显示大气层
      skyBox: false, // 是否显示天空盒
      vrButton: false, // 是否显示VR按钮
    });

    // 1, 去除版权信息
    (viewer.cesiumWidget.creditContainer as HTMLElement).style.display = 'none';

    // 修改 homeButton 的位置
    let initView = {
      destination: Cesium.Cartesian3.fromDegrees(116.3974, 39.9093, 15000000),
    };
    // viewer.camera.setView(initView);
    viewer.camera.flyTo(initView);

    setViewer(viewer);

    setTimeout(() => {
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      handlerIcon(viewer);
    }, 100);

    // 销毁
    return () => {
      viewer.destroy();
    };
  }, []);

  const handlerIcon = (viewer: any) => {
    // 添加图标
    let item = iconData[0];
    let entity = viewer.entities.add({
      id: item.id,
      position: Cesium.Cartesian3.fromDegrees(item.longitude, item.latitude),
      billboard: {
        image: require('@/assets/Detection.png'),
        scale: 0.3,
      },
    });
    entity.properties = {
      text: item.label,
    };
  };

  // NOTE 绘制开始
  const [drawing, setDrawing] = useState(false);
  const drawingRef = React.useRef(false);
  const positionsArrRef = React.useRef([] as any[]);
  const positionsGeoRef = React.useRef([] as any[]);
  const handlerRef = React.useRef(null as any);
  const handlerDraw = () => {
    // 1, 点击按钮开始绘制
    drawingRef.current = true;
    setDrawing(true);
    viewer.cesiumWidget._element.style.cursor = 'crosshair'; // 鼠标样式为十字

    // 获取所有实体
    let entities = viewer.entities.values;
    let entity = entities.find((item: any) => item.properties.text._value === 'A');
    console.log(entity);
    // 计算entity的经纬度
    let cartographic = viewer.scene.globe.ellipsoid.cartesianToCartographic(entity.position._value);
    let lng = Cesium.Math.toDegrees(cartographic.longitude);
    let lat = Cesium.Math.toDegrees(cartographic.latitude);

    // 计算entity笛卡尔坐标系 xy 坐标
    let position = Cesium.Cartesian3.fromDegrees(lng, lat);
    positionsArrRef.current = [position];
    positionsGeoRef.current = [{ longitude: lng, latitude: lat }];

    // 2, 点击地图后, 在点击处绘制圆形的形状, 并且在地图上显示坐标
    handlerRef.current = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas); // 鼠标事件处理器

    handlerRef.current.setInputAction((movement: any) => {
      console.log(1111111111111111);
      // 获取鼠标位置的笛卡尔坐标
      let cartesian = viewer.camera.pickEllipsoid(
        movement.position, // 鼠标位置
        viewer.scene.globe.ellipsoid, // 椭球体
      );

      if (cartesian && drawingRef.current) {
        console.log('22222222222222222222222222222222');
        let cartographic = Cesium.Cartographic.fromCartesian(cartesian); // 笛卡尔坐标转经纬度
        let longitudeString = Cesium.Math.toDegrees(cartographic.longitude); // 经度
        let latitudeString = Cesium.Math.toDegrees(cartographic.latitude); // 纬度
        let heightString = cartographic.height.toFixed(2); // 高度
        console.log(longitudeString, latitudeString, heightString);

        // 绘制圆形
        viewer.entities.add({
          position: cartesian,
          ellipse: {
            semiMinorAxis: 30000.0,
            semiMajorAxis: 30000.0,
            material: new Cesium.Color(1.0, 1.0, 1.0, 0.5),
          },
        });

        // 连接上一个点和当前点
        if (positionsArrRef.current.length >= 1) {
          let lastCartesian = positionsArrRef.current[positionsArrRef.current.length - 1]; // 上一个点
          // 绘制实线
          viewer.entities.add({
            polyline: {
              // positions: [lastCartesian, cartesian],
              positions: new Cesium.CallbackProperty(() => {
                // 实时更新
                return [lastCartesian, cartesian]; // 返回两个点
              }, false), // false 表示不更新
              width: 2, // 线宽
              // material: new Cesium.PolylineDashMaterialProperty({ // 虚线材质
              //   color: Cesium.Color.YELLOW,
              // }),
              material: Cesium.Color.YELLOW, // 实线材质
            },
          });
        }

        // 5, 存储点的数组
        positionsArrRef.current = [...positionsArrRef.current, cartesian];
        positionsGeoRef.current = [
          ...positionsGeoRef.current,
          { longitude: longitudeString, latitude: latitudeString },
        ];
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
  };

  // NOTE 绘制完成回调
  const handlerDrawOk = () => {
    setDrawing(false);
    drawingRef.current = false;
    viewer.cesiumWidget._element.style.cursor = 'default'; // 鼠标样式为默认

    handlerRef.current.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);

    console.log('positionsArrRef', positionsArrRef.current);
    console.log('positionsGeoRef', positionsGeoRef.current);

    positionsArrRef.current = [];
    positionsGeoRef.current = [];
  };

  return (
    <>
      <Alert className="mb-2" message="轨迹" type="success" />
      <ProCard>
        <div id="cesiumContainer" className="static" />
        <div className="absolute top-8 left-8">
          {drawing ? (
            <Button id="startDrawing" className="text-cyan-50 hover:text-gray-900" onClick={() => handlerDrawOk()}>
              绘制完成
            </Button>
          ) : (
            <Button id="startDrawing" className="text-cyan-50 hover:text-gray-900" onClick={() => handlerDraw()}>
              开始绘制
            </Button>
          )}
        </div>
      </ProCard>
    </>
  );
};

export default Trajectory;
