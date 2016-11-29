class EventRouter {
  /**
   * @param {(Array|string)} routeData
   * @return {{useCaseName: ?string, fixedUseCaseArgs: Array<*>}}
   */
  static _parseRouteData(routeData) {
    let useCaseName = null;
    let fixedUseCaseArgs = [];

    if (Array.isArray(routeData)) {
      [useCaseName, ...fixedUseCaseArgs] = routeData;
      if (useCaseName === undefined) useCaseName = null;
    } else if (typeof routeData === 'string') {
      useCaseName = routeData;
    }

    return {
      useCaseName,
      fixedUseCaseArgs: fixedUseCaseArgs,
    };
  }

  /**
   * @param {Object.<string, (Array|string)>} routes
   */
  constructor(routes) {
    this._parsedRoutes = {};
    Object.keys(routes).forEach(eventName => {
      const routeData = routes[eventName];
      const parsedRouteData = EventRouter._parseRouteData(routeData);

      if (parsedRouteData.useCaseName === null) {
        throw new Error(`A invalid route data of \`${ routeData }\` is set to the "${ eventName }" event`);
      }

      this._parsedRoutes[eventName] = parsedRouteData;
    });
  }

  /**
   * Convert general event data to the internal use-case execution data
   * @param {string} eventName
   * @param {...*} payloads
   * @return {Array} ex) [useCaseName, ...useCaseArgs]
   */
  eventDataToUseCaseExecutionQuery(eventName, ...payloads) {
    const { useCaseName, fixedUseCaseArgs } = this._parsedRoutes[eventName];

    return [useCaseName].concat(fixedUseCaseArgs, payloads);
  }
}

module.exports = EventRouter;
