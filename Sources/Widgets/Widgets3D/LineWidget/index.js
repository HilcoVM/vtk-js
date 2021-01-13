import { distance2BetweenPoints } from 'vtk.js/Sources/Common/Core/Math';
import macro from 'vtk.js/Sources/macro';
import stateGenerator from 'vtk.js/Sources/Widgets/Widgets3D/LineWidget/state';
import vtkAbstractWidgetFactory from 'vtk.js/Sources/Widgets/Core/AbstractWidgetFactory';
import vtkArrowHandleRepresentation from 'vtk.js/Sources/Widgets/Representations/ArrowHandleRepresentation';
import vtkPlanePointManipulator from 'vtk.js/Sources/Widgets/Manipulators/PlaneManipulator';
import vtkSVGLandmarkRepresentation from 'vtk.js/Sources/Widgets/SVG/SVGLandmarkRepresentation';
import vtkPolyLineRepresentation from 'vtk.js/Sources/Widgets/Representations/PolyLineRepresentation';
import widgetBehavior from 'vtk.js/Sources/Widgets/Widgets3D/LineWidget/behavior';
import { ViewTypes } from 'vtk.js/Sources/Widgets/Core/WidgetManager/Constants';
import {
  updateTextPosition,
  getNbHandles,
} from 'vtk.js/Sources/Widgets/Widgets3D/LineWidget/helper';
// ----------------------------------------------------------------------------
// Factory
// ----------------------------------------------------------------------------

function vtkLineWidget(publicAPI, model) {
  model.classHierarchy.push('vtkLineWidget');
  model.widgetState = stateGenerator();
  model.behavior = widgetBehavior;

  console.log('after this part?');

  // --- Widget Requirement ---------------------------------------------------

  model.methodsToLink = [
    'activeScaleFactor',
    'activeColor',
    'useActiveColor',
    'glyphResolution',
    'defaultScale',
  ];

  publicAPI.getRepresentationsForViewType = (viewType) => {
    console.log('when are you built?');
    switch (viewType) {
      case ViewTypes.DEFAULT:
      case ViewTypes.GEOMETRY:
      case ViewTypes.SLICE:
      case ViewTypes.VOLUME:
      default:
        return [
          {
            builder: vtkArrowHandleRepresentation,
            labels: ['handle1'],
            initialValues: {
              /* to scale handle size when zooming/dezooming, optional */
              scaleInPixels: true,
              /*
               * This table sets the visibility of the handles' actors
               * 1st actor is a displayActor, which hides a rendered object on the HTML layer.
               * operating on its value allows to hide a handle to the user while still being
               * able to detect its presence, so the user can move it. 2nd actor is a classic VTK
               * actor which renders the object on the VTK scene
               */
              visibilityFlagArray: [false, false],
            },
          },
          {
            builder: vtkArrowHandleRepresentation,
            labels: ['handle2'],
            initialValues: {
              /* to scale handle size when zooming/dezooming, optional */
              scaleInPixels: true,
              /*
               * This table sets the visibility of the handles' actors
               * 1st actor is a displayActor, which hides a rendered object on the HTML layer.
               * operating on its value allows to hide a handle to the user while still being
               * able to detect its presence, so the user can move it. 2nd actor is a classic VTK
               * actor which renders the object on the VTK scene
               */
              visibilityFlagArray: [false, false],
            },
          },
          {
            builder: vtkArrowHandleRepresentation,
            labels: ['moveHandle'],
            initialValues: {
              scaleInPixels: true,
              visibilityFlagArray: [false, false],
            },
          },
          {
            builder: vtkSVGLandmarkRepresentation,
            initialValues: {
              showCircle: false,
              isVisible: false,
              offsetText: true,
              text: '',
            },
            labels: ['SVGtext'],
          },
          {
            builder: vtkPolyLineRepresentation,
            labels: ['handle1', 'handle2', 'moveHandle'],
            initialValues: { scaleInPixels: true },
          },
        ];
    }
  };

  // --- Public methods -------------------------------------------------------

  publicAPI.getDistance = () => {
    const nbHandles = getNbHandles(model);
    if (
      nbHandles < 1 ||
      (nbHandles === 1 &&
        model.widgetState.getHandle2().getOrigin().length === 0)
    ) {
      return 0;
    }
    const secondPoint =
      nbHandles === 2 && model.widgetState.getMoveHandle().getActive()
        ? model.widgetState.getMoveHandle().getOrigin()
        : model.widgetState.getHandle2().getOrigin();
    return Math.sqrt(
      distance2BetweenPoints(
        model.widgetState.getHandle1().getOrigin(),
        secondPoint
      )
    );
  };

  // --------------------------------------------------------------------------
  // initialization
  // --------------------------------------------------------------------------

  model.widgetState.onBoundsChange((bounds) => {
    const center = [
      (bounds[0] + bounds[1]) * 0.5,
      (bounds[2] + bounds[3]) * 0.5,
      (bounds[4] + bounds[5]) * 0.5,
    ];
    model.widgetState.getMoveHandle().setOrigin(center);
  });

  model.widgetState.getPositionOnLine().onModified(() => {
    updateTextPosition(model);
  });

  // Default manipulator
  model.manipulator = vtkPlanePointManipulator.newInstance();
}

// ----------------------------------------------------------------------------

const DEFAULT_VALUES = {
  isDragging: false,
};

// ----------------------------------------------------------------------------

export function extend(publicAPI, model, initialValues = {}) {
  Object.assign(model, DEFAULT_VALUES, initialValues);

  vtkAbstractWidgetFactory.extend(publicAPI, model, initialValues);
  macro.setGet(publicAPI, model, ['manipulator', 'isDragging']);

  vtkLineWidget(publicAPI, model);
}

// ----------------------------------------------------------------------------

export const newInstance = macro.newInstance(extend, 'vtkLineWidget');

// ----------------------------------------------------------------------------

export default { newInstance, extend };
