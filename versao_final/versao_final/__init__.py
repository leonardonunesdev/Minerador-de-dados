from pyramid.config import Configurator


def main(global_config, **settings):
    """ This function returns a Pyramid WSGI application.
    """
    config = Configurator(settings=settings)
    config.include('pyramid_jinja2')
    config.add_static_view('static', 'static', cache_max_age=3600)
    config.add_route('home', '/')
    config.add_route('gera_regras_apriori', '/regra_apriori')
    config.add_route('gera_regras_fp_growth', '/regra_fp_growth')
    config.scan()
    return config.make_wsgi_app()
