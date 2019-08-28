var cpu_type_to_cpu_map = {
  'large': 1,
  'xlarge': 2,
  '2xlarge': 4,
  '4xlarge': 8,
  '8xlarge': 16,
  '10xlarge': 32,
};

/**
 * @description Generates the report for the affordable instances for a user
 * 
 * @param {object} instances Array of instances
 * @param {number} hours Number of hours
 * @param {number} cpus Number of cpus, Pass null when not required
 * @param {number} price Price (Maximum that can be paid by the user), , Pass null when not required
 * 
 * @returns {object} Affordable list of servers and regions
 */

function get_costs(instances, hours, cpus = null, price = null) {
  let result;
  if (cpus == null) {
    result = _get_costs_wrt_max_price(instances, price, hours);
  } else if (price == null) {
    result = _get_costs_wrt_min_cpus(instances, cpus, hours);
  } else {
    result = _get_costs_wrt_min_cpus_max_price(instances, cpus, price, hours);
  }
  result = result.sort((a, b) => a.total_cost - b.total_cost);
  result.forEach((r) => {
    r.total_cost = '$' + r.total_cost;
  });
  return result;
}


/**
 * @description Helper method used when both the price and cpus are in input
 * 
 * @param {object} instances Array of instances
 * @param {number} hours Number of hours
 * @param {number} cpus Number of cpus
 * @param {number} price Price (Maximum that can be paid by the user)
 * 
 * @returns {object} Affordable list of servers and regions
 */

function _get_costs_wrt_min_cpus_max_price(instances, cpus, price, total_hours = 1) {
  let result = _get_costs_wrt_min_cpus(instances, cpus, total_hours);
  result = result.filter((r) => {
    return (r.total_cost < price);
  });

  return result;
}


/**
 * @description Helper method used when only cpus are in input
 * 
 * @param {object} instances Array of instances
 * @param {number} hours Number of hours
 * @param {number} tmp_cpus Number of cpus
 * 
 * @returns {object} Affordable list of servers and regions
 */

function _get_costs_wrt_min_cpus(instances, cpus, total_hours = 1) {
  if (cpus < 1) {
    return [];
  }
  const result = Object.keys(instances).map((region) => {
    var tmp_cpus = cpus;
    const instance = instances[region];
    const sorted_instance_array = sort_server_type_wrt_cpus(instance);
    let i = sorted_instance_array.length - 1;
    let ubi = sorted_instance_array.length;
    let servers = [];
    let total_cost = 0;
    while (tmp_cpus > 0 && i > -1) {
      var cpu_data = sorted_instance_array[i];
      if (cpu_data.n_cpus / tmp_cpus <= 1) {
        const how_many_servers = parseInt(tmp_cpus / cpu_data.n_cpus);
        const how_many_cpus = cpu_data.n_cpus * how_many_servers;
        tmp_cpus -= how_many_cpus;
        servers.unshift([cpu_data.cpu_type, how_many_servers]);
        total_cost += cpu_data.cost * how_many_servers;
        if (ubi == sorted_instance_array.length) {
          ubi = i;
        }
      }
      i--;
    }

    // The following code is kind of an optimisation i.e. if a higher server has a lower cost than the total, we recommend that to the user
    if (ubi < sorted_instance_array.length - 1 && sorted_instance_array[ubi + 1].cost < total_cost) {
      var cpu_data = sorted_instance_array[ubi + 1];
      servers = [[cpu_data.cpu_type, 1]];
      total_cost = cpu_data.cost;
    }
    return {region, servers, total_cost: (total_cost * total_hours)};
  });

  return result;
}


/**
 * @description Helper method used when only the price is in input
 * 
 * @param {object} instances Array of instances
 * @param {number} hours Number of hours
 * @param {number} tmp_price Price (Maximum that can be paid by the user)
 * 
 * @returns {object} Affordable list of servers and regions
 */

function _get_costs_wrt_max_price(instances, price, total_hours = 1) {
  price /= total_hours;
  const result = Object.keys(instances).map((region) => {
    var tmp_price = price;
    const instance = instances[region];
    const sorted_instance_array = sort_server_type_wrt_cpus(instance);
    let i = sorted_instance_array.length - 1;
    const servers = [];
    let total_cost = 0;
    while (tmp_price > 0 && i > -1) {
      const cpu_data = sorted_instance_array[i];
      if (cpu_data.cost / tmp_price <= 1) {
        const how_many_servers = parseInt(tmp_price / cpu_data.cost);
        const how_much_cost = cpu_data.cost * how_many_servers;

        tmp_price -= how_much_cost;
        servers.unshift([cpu_data.cpu_type, how_many_servers]);
        total_cost += cpu_data.cost * how_many_servers;
      }
      i--;
    }

    return {region, servers, total_cost: (total_cost * total_hours)};
  }).filter((r) => r.servers.length);

  return result;
}

/**
 * @description Internal Method - Maps the instance list to an array (sorted wrt CPUs)
 * 
 * @param {object} instance Instance list
 * 
 * @returns {Array}
 */

function sort_server_type_wrt_cpus(instance) {
  const sortable = []; // Will be sets of 3: eg. [large, 1, price]
  for (const cpu_type in instance) {
    sortable.push({
      cpu_type: cpu_type,
      n_cpus: cpu_type_to_cpu_map[cpu_type],
      cost: instance[cpu_type],
    });
  }

  sortable.sort(function(a, b) {
    return a.n_cpus - b.n_cpus;
  });

  return sortable;
}


exports.get_costs = get_costs;