import { computed, h, inject, ref } from "vue";
import InicioView from "../views/InicioView.vue";
import RegistroView from "../views/RegistroView.vue";
import HomeView from "../views/HomeView.vue";
import ClasesView from "../views/ClasesView.vue";
import InscribirClaseView from "../views/InscribirClaseView.vue";
import MisClasesView from "../views/MisClasesView.vue";
import PerfilView from "../views/PerfilView.vue";

const ROUTER_KEY = Symbol("app-router");

const routeTable = [
  { path: "/", name: "inicio", component: InicioView, publica: true },
  { path: "/registro", name: "registro", component: RegistroView, publica: true },
  { path: "/home", name: "home", component: HomeView },
  { path: "/admin", name: "admin", component: ClasesView },
  { path: "/clases", name: "clases", component: ClasesView },
  {
    path: "/inscribir-clase",
    name: "inscribir-clase",
    component: InscribirClaseView,
  },
  {
    path: "/mis-clases",
    name: "mis-clases",
    component: MisClasesView,
  },
  {
    path: "/perfil",
    name: "perfil",
    component: PerfilView,
  },
];

const fallbackRouteName = "inicio";
const routesByPath = new Map(routeTable.map((route) => [route.path, route]));
const routesByName = new Map(routeTable.map((route) => [route.name, route]));

function usuarioEstaLogueado() {
  try {
    const textoUsuario = localStorage.getItem("user");
    const token = String(localStorage.getItem("token") || "").trim();
    if (!textoUsuario) return false;
    if (!token) return false;

    const usuario = JSON.parse(textoUsuario);
    return Boolean(usuario && typeof usuario === "object");
  } catch {
    return false;
  }
}

function obtenerAcceso(path) {
  const route = routesByPath.get(path);
  if (route?.publica || usuarioEstaLogueado()) {
    return path;
  }

  return routesByName.get(fallbackRouteName)?.path || "/";
}

function normalizaPath(path) {
  if (!path) return "/";
  const parseado = path.startsWith("http")
    ? new URL(path)
    : new URL(path, window.location.origin);
  let normalizado = parseado.pathname || "/";

  if (!normalizado.startsWith("/")) normalizado = `/${normalizado}`;
  if (normalizado.length > 1 && normalizado.endsWith("/")) {
    normalizado = normalizado.slice(0, -1);
  }

  return normalizado;
}

function path(target) {
  if (typeof target === "string") return normalizaPath(target);

  if (target && typeof target === "object") {
    if (target.path) return normalizaPath(target.path);
    if (target.name) {
      const route = routesByName.get(target.name);
      return route ? route.path : "/";
    }
  }

  return "/";
}

function encontrarRuta(path) {
  return routesByPath.get(path) || routesByName.get(fallbackRouteName);
}

const pathInicial = normalizaPath(window.location.pathname);
const pathInicialSeguro = obtenerAcceso(pathInicial);

if (pathInicial !== pathInicialSeguro) {
  window.history.replaceState({}, "", pathInicialSeguro);
}

const currentPath = ref(pathInicialSeguro);

function applyNavigation(target, replace = false) {
  const nextPath = obtenerAcceso(path(target));
  const current = currentPath.value;

  if (nextPath === current) return;

  if (replace) {
    window.history.replaceState({}, "", nextPath);
  } else {
    window.history.pushState({}, "", nextPath);
  }

  currentPath.value = normalizaPath(window.location.pathname);
}

const router = {
  currentPath,
  push(target) {
    applyNavigation(target, false);
  },
  replace(target) {
    applyNavigation(target, true);
  },
};

window.addEventListener("popstate", () => {
  const path = normalizaPath(window.location.pathname);
  const pathSeguro = obtenerAcceso(path);

  if (path !== pathSeguro) {
    window.history.replaceState({}, "", pathSeguro);
  }

  currentPath.value = pathSeguro;
});

const RouterView = {
  name: "RouterView",
  setup() {
    return () => {
      const match = encontrarRuta(currentPath.value);
      return h(match.component);
    };
  },
};

const RouterLink = {
  name: "RouterLink",
  props: {
    to: {
      type: [String, Object],
      required: true,
    },
  },
  setup(props, { attrs, slots }) {
    const href = computed(() => path(props.to));

    function onClick(event) {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      event.preventDefault();
      router.push(props.to);
    }

    return () =>
      h(
        "a",
        {
          ...attrs,
          href: href.value,
          onClick,
        },
        slots.default ? slots.default() : href.value
      );
  },
};

const routerPlugin = {
  install(app) {
    app.provide(ROUTER_KEY, router);
    app.component("RouterView", RouterView);
    app.component("RouterLink", RouterLink);
  },
};

export function useRouter() {
  const routerInstance = inject(ROUTER_KEY);
  if (!routerInstance) {
    throw new Error("Router is not installed");
  }
  return routerInstance;
}

export default routerPlugin;

